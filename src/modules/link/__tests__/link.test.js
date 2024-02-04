import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Format, Markup } from 'telegraf';
import * as td from 'testdouble';
import LinkModule from '../index.js';

describe('link module', () => {
  afterEach(() => td.reset());

  it('should register link command handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    LinkModule.configure(bot);
    td.verify(bot.command('link', td.matchers.isA(Function)));
  });

  describe('link command handler', () => {
    let ctx;
    let captor;

    beforeEach(() => {
      const bot = td.object([ 'action', 'command' ]);
      ctx = td.object({
        botInfo: { username: 'botUsername' },
        from: { id: 'fromId' },
        reply: () => {},
      });
      captor = td.matchers.captor();
      LinkModule.configure(bot);
      td.verify(bot.command('link', captor.capture()));
    });

    it('should reply with plain link if there is no payload', async () => {
      await captor.value(ctx);
      td.verify(ctx.reply(
        'https://t.me/botUsername?start=fromId',
        Markup.inlineKeyboard([
          Markup.button.callback(td.matchers.isA(String), 'link_for_groups'),
        ]),
      ));
    });

    it('should reply with text link if there is payload', async () => {
      ctx.payload = 'payload';
      await captor.value(ctx);
      td.verify(ctx.reply(
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
          Markup.button.callback(td.matchers.isA(String), 'link_for_groups'),
        ]),
      ));
    });
  });

  it('should register link_for action handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    LinkModule.configure(bot);
    td.verify(bot.action(/^link_for_(groups|private)$/, td.matchers.isA(Function)));
  });

  describe('link_for action handler', () => {
    let ctx;
    let captor;

    beforeEach(() => {
      const bot = td.object([ 'action', 'command' ]);
      ctx = td.object({
        from: { id: 'fromId' },
        chat: { id: 'chatId' },
        callbackQuery: { message: { message_id: 'messageId', text: 'text' } },
        botInfo: { username: 'botUsername' },
        telegram: { editMessageText: () => {} },
      });
      captor = td.matchers.captor();
      LinkModule.configure(bot);
      td.verify(bot.action(/^link_for_(groups|private)$/, captor.capture()));
    });

    describe('if link is plain link', () => {
      beforeEach(() => {
        ctx.callbackQuery.message.entities = [{ type: 'url' }];
      });

      it('should change groups link to private link', async () => {
        ctx.match = [ null, 'private' ];
        await captor.value(ctx);
        td.verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          'https://t.me/botUsername?start=fromId',
          Markup.inlineKeyboard([
            Markup.button.callback(td.matchers.isA(String), 'link_for_groups'),
          ]),
        ));
      });

      it('should change private link to groups link', async () => {
        ctx.match = [ null, 'groups' ];
        await captor.value(ctx);
        td.verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          'https://t.me/botUsername?startgroup=fromId',
          Markup.inlineKeyboard([
            Markup.button.callback(td.matchers.isA(String), 'link_for_private'),
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
        td.verify(ctx.telegram.editMessageText(
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
            Markup.button.callback(td.matchers.isA(String), 'link_for_groups'),
          ]),
        ));
      });

      it('should change private link to groups link', async () => {
        ctx.match = [ null, 'groups' ];
        await captor.value(ctx);
        td.verify(ctx.telegram.editMessageText(
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
            Markup.button.callback(td.matchers.isA(String), 'link_for_private'),
          ]),
        ));
      });
    });
  });
});
