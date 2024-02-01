import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import SharedHelpSupportSection from '@tmible/wishlist-bot/constants/help/sections/shared/support';
import HelpMessageMarkup from '@tmible/wishlist-bot/constants/help/message-markup';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('help module', () => {
  let HelpModule;

  beforeEach(async () => {
    const isChatGroup = (await td.replaceEsm(await resolveModule(
      '@tmible/wishlist-bot/helpers/is-chat-group',
    ))).default;
    HelpModule = (await import('../index.js')).default;
    td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
  });

  afterEach(() => td.reset());

  it('should register help command handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    HelpModule.configure(bot);
    td.verify(bot.command('help', td.matchers.isA(Function)));
  });

  describe('help command handler', () => {
    it('should reply', async (testContext) => {
      const generalHelpSection = (await td.replaceEsm(await resolveModule(
        '@tmible/wishlist-bot/constants/help/sections/default/general',
      ))).default;

      const bot = td.object([ 'action', 'command' ]);
      const replyWithMarkdownV2 = testContext.mock.fn(async () => {});
      const captor = td.matchers.captor();

      HelpModule.configure(bot);
      td.verify(bot.command('help', captor.capture()));

      await captor.value({ replyWithMarkdownV2 });

      assert.deepEqual(
        replyWithMarkdownV2.mock.calls[0].arguments,
        [ `${generalHelpSection}\n\n${SharedHelpSupportSection}`, HelpMessageMarkup ],
      );
    });
  });

  it('should register help action handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    HelpModule.configure(bot);
    td.verify(bot.action(/^help ([a-z\-]+)$/, td.matchers.isA(Function)));
  });

  describe('help action handler', () => {
    it('should edit help message', async (testContext) => {
      const nicknameHelpSection = (await td.replaceEsm(await resolveModule(
        '@tmible/wishlist-bot/constants/help/sections/default/nickname',
      ))).default;

      const bot = td.object([ 'action', 'command' ]);
      const editMessageText = testContext.mock.fn(async () => {});
      const captor = td.matchers.captor();

      HelpModule.configure(bot);
      td.verify(bot.action(/^help ([a-z\-]+)$/, captor.capture()));

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
