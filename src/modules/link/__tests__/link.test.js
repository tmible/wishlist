import { afterEach, beforeEach, describe, it } from 'node:test';
import { Format, Markup } from 'telegraf';
import { matchers, object, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const { inject } = await replaceModule('@tmible/wishlist-bot/architecture/dependency-injector');
const LinkModule = await import('../index.js').then((module) => module.default);

describe('link module', () => {
  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn({ debug: () => {} });
  });

  afterEach(reset);

  it('should register link command handler', () => {
    const bot = object([ 'action', 'command' ]);
    LinkModule.configure(bot);
    verify(bot.command('link', matchers.isA(Function)));
  });

  describe('link command handler', () => {
    let ctx;
    let captor;

    beforeEach(() => {
      const bot = object([ 'action', 'command' ]);
      ctx = object({
        botInfo: { username: 'botUsername' },
        from: { id: 'fromId' },
        reply: () => {},
      });
      captor = matchers.captor();
      LinkModule.configure(bot);
      verify(bot.command('link', captor.capture()));
    });

    it('should reply with plain link if there is no payload', async () => {
      await captor.value(ctx);
      verify(ctx.reply(
        'https://t.me/botUsername?start=fromId',
        Markup.inlineKeyboard([
          Markup.button.callback(matchers.isA(String), 'link_for_groups'),
        ]),
      ));
    });

    it('should reply with text link if there is payload', async () => {
      ctx.payload = 'payload';
      await captor.value(ctx);
      verify(ctx.reply(
        new Format.FmtString(
          'payload',
          [{
            type: 'text_link',
            offset: 0,
            length: 7,
            url: 'https://t.me/botUsername?start=fromId',
          }],
        ),
        Markup.inlineKeyboard([
          Markup.button.callback(matchers.isA(String), 'link_for_groups'),
        ]),
      ));
    });
  });

  it('should register link_for action handler', () => {
    const bot = object([ 'action', 'command' ]);
    LinkModule.configure(bot);
    verify(bot.action(/^link_for_(groups|private)$/, matchers.isA(Function)));
  });

  describe('link_for action handler', () => {
    let ctx;
    let captor;

    beforeEach(() => {
      const bot = object([ 'action', 'command' ]);
      ctx = object({
        from: { id: 'fromId' },
        chat: { id: 'chatId' },
        callbackQuery: { message: { message_id: 'messageId', text: 'text' } },
        botInfo: { username: 'botUsername' },
        telegram: { editMessageText: () => {} },
      });
      captor = matchers.captor();
      LinkModule.configure(bot);
      verify(bot.action(/^link_for_(groups|private)$/, captor.capture()));
    });

    describe('if link is plain link', () => {
      beforeEach(() => {
        ctx.callbackQuery.message.entities = [{ type: 'url' }];
      });

      it('should change groups link to private link', async () => {
        ctx.match = [ null, 'private' ];
        await captor.value(ctx);
        verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          'https://t.me/botUsername?start=fromId',
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'link_for_groups'),
          ]),
        ));
      });

      it('should change private link to groups link', async () => {
        ctx.match = [ null, 'groups' ];
        await captor.value(ctx);
        verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          'https://t.me/botUsername?startgroup=fromId',
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'link_for_private'),
          ]),
        ));
      });
    });

    describe('if link is text link', () => {
      beforeEach(() => {
        ctx.callbackQuery.message.entities = [{ type: 'text_link' }];
      });

      it('should change groups link to private link', async () => {
        ctx.match = [ null, 'private' ];
        await captor.value(ctx);
        verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          new Format.FmtString(
            'text',
            [{
              type: 'text_link',
              offset: 0,
              length: 4,
              url: 'https://t.me/botUsername?start=fromId',
            }],
          ),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'link_for_groups'),
          ]),
        ));
      });

      it('should change private link to groups link', async () => {
        ctx.match = [ null, 'groups' ];
        await captor.value(ctx);
        verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          new Format.FmtString(
            'text',
            [{
              type: 'text_link',
              offset: 0,
              length: 4,
              url: 'https://t.me/botUsername?startgroup=fromId',
            }],
          ),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'link_for_private'),
          ]),
        ));
      });
    });
  });
});
