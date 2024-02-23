import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import HelpMessageMarkup from '../constants/message-markup.const.js';
import SharedHelpSupportSection from '../constants/sections/shared/support.const.js';

const isChatGroup = await replaceModule('@tmible/wishlist-bot/helpers/is-chat-group');
const HelpModule = await import('../index.js').then((module) => module.default);

describe('help module', () => {
  beforeEach(() => {
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
  });

  afterEach(reset);

  it('should register help command handler', () => {
    const bot = object([ 'action', 'command' ]);
    HelpModule.configure(bot);
    verify(bot.command('help', matchers.isA(Function)));
  });

  describe('help command handler', () => {
    it('should reply', async (testContext) => {
      const generalHelpSection = await replaceEsm('../constants/sections/default/general.const.js')
        .then((module) => module.default);

      const bot = object([ 'action', 'command' ]);
      const replyWithMarkdownV2 = testContext.mock.fn();
      const captor = matchers.captor();

      HelpModule.configure(bot);
      verify(bot.command('help', captor.capture()));

      await captor.value({ replyWithMarkdownV2 });

      assert.deepEqual(
        replyWithMarkdownV2.mock.calls[0].arguments,
        [ `${generalHelpSection}\n\n${SharedHelpSupportSection}`, HelpMessageMarkup ],
      );
    });
  });

  it('should register help action handler', () => {
    const bot = object([ 'action', 'command' ]);
    HelpModule.configure(bot);
    verify(bot.action(/^help ([a-z-]+)$/, matchers.isA(Function)));
  });

  describe('help action handler', () => {
    it('should edit help message', async (testContext) => {
      const nicknameHelpSection = await replaceEsm(
        '../constants/sections/default/nickname.const.js',
      ).then((module) => module.default);

      const bot = object([ 'action', 'command' ]);
      const editMessageText = testContext.mock.fn();
      const captor = matchers.captor();

      HelpModule.configure(bot);
      verify(bot.action(/^help ([a-z-]+)$/, captor.capture()));

      await captor.value({
        chat: { id: 'chatId' },
        callbackQuery: { message: { message_id: 'messageId' } },
        match: [ null, 'nickname' ],
        telegram: { editMessageText },
      });

      assert.deepEqual(
        editMessageText.mock.calls[0].arguments,
        [
          'chatId',
          'messageId',
          undefined,
          `${nicknameHelpSection}\n\n${SharedHelpSupportSection}`,
          { ...HelpMessageMarkup, parse_mode: 'MarkdownV2' },
        ],
      );
    });
  });
});
