import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import SharedHelpSupportSection from '../constants/sections/shared/support.const.js';

const bot = object([ 'action', 'command' ]);

const [ isChatGroup, generalHelpSection, nicknameHelpSection ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceEsm('../constants/sections/default/general.const.js').then((module) => module.default),
  replaceEsm('../constants/sections/default/nickname.const.js').then((module) => module.default),
]);

const HelpModule = await import('../index.js').then((module) => module.default);

describe('help module', () => {
  beforeEach(() => {
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
  });

  afterEach(reset);

  it('should register help command handler', () => {
    HelpModule.configure(bot);
    verify(bot.command('help', matchers.isA(Function)));
  });

  describe('help command handler', () => {
    it('should reply', async (testContext) => {

      const replyWithMarkdownV2 = testContext.mock.fn();
      const captor = matchers.captor();

      HelpModule.configure(bot);
      verify(bot.command('help', captor.capture()));

      await captor.value({ replyWithMarkdownV2 });

      assert.deepEqual(
        replyWithMarkdownV2.mock.calls[0].arguments,
        [
          `${generalHelpSection}\n\n${SharedHelpSupportSection}`,
          Markup.inlineKeyboard([[
            Markup.button.callback('ℹ️ Общее', 'help general general'),
            Markup.button.callback('✨ Список желаний', 'help foreign-list general'),
          ], [
            Markup.button.callback('🥷 Никнейм', 'help nickname general'),
            Markup.button.callback('🤖 Список команд', 'help command-list general'),
          ]]),
        ],
      );
    });
  });

  it('should register help action handler', () => {
    HelpModule.configure(bot);
    verify(bot.action(/^help ([a-z-]+) ([a-z-]+)$/, matchers.isA(Function)));
  });

  describe('help action handler', () => {
    let editMessageText;
    let captor;

    beforeEach(() => {
      editMessageText = mock.fn();
      captor = matchers.captor();
      HelpModule.configure(bot);
      verify(bot.action(/^help ([a-z-]+) ([a-z-]+)$/, captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should edit help message', async () => {
      await captor.value({
        chat: { id: 'chatId' },
        callbackQuery: { message: { message_id: 'messageId' } },
        match: [ null, 'nickname', 'general' ],
        telegram: { editMessageText },
      });

      assert.deepEqual(
        editMessageText.mock.calls[0].arguments,
        [
          'chatId',
          'messageId',
          undefined,
          `${nicknameHelpSection}\n\n${SharedHelpSupportSection}`,
          {
            ...Markup.inlineKeyboard([[
              Markup.button.callback('ℹ️ Общее', 'help general nickname'),
              Markup.button.callback('✨ Список желаний', 'help foreign-list nickname'),
            ], [
              Markup.button.callback('🥷 Никнейм', 'help nickname nickname'),
              Markup.button.callback('🤖 Список команд', 'help command-list nickname'),
            ]]),
            parse_mode: 'MarkdownV2',
          },
        ],
      );
    });

    it('should not edit help message if same section is requested', async () => {
      await captor.value({
        chat: { id: 'chatId' },
        callbackQuery: { message: { message_id: 'messageId' } },
        match: [ null, 'nickname', 'nickname' ],
        telegram: { editMessageText },
      });

      assert.equal(editMessageText.mock.calls.length, 0);
    });
  });
});
