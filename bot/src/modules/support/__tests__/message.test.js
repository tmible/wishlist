import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Format, Markup } from 'telegraf';
import { matchers, object, reset, verify } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const {
  sendMessageAndMarkItForMarkupRemove,
} = await replaceModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup');
const MessageModule = await import('../message.js').then((module) => module.default);

describe('support / message', () => {
  let ctx;
  let captor;

  afterEach(reset);

  it('should register support command handler', () => {
    const bot = object([ 'command' ]);
    MessageModule.configure(bot);
    verify(bot.command('support', matchers.isA(Function)));
  });

  describe('support command handler', () => {
    beforeEach(async () => {
      const bot = object([ 'command' ]);
      captor = matchers.captor();
      MessageModule.configure(bot);
      verify(bot.command('support', captor.capture()));
      ctx = { chat: {}, session: {} };
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(
        ctx.session,
        { messagePurpose: { type: MessagePurposeType.SupportMessage } },
      );
    });

    it('should reply', () => {
      verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        matchers.isA(String),
        Markup.inlineKeyboard([
          Markup.button.callback(matchers.isA(String), 'cancel_support_message'),
        ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    MessageModule.messageHandler(bot);
    verify(bot.on('message', matchers.isA(Function)));
  });

  describe('message handler', () => {
    let next;

    beforeEach(() => {
      const bot = object([ 'on' ]);
      next = mock.fn();
      captor = matchers.captor();
      MessageModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is SupportMessage message purpose in session', () => {
      beforeEach(async () => {
        process.env.SUPPORT_ACCOUNT_USERID = 'SUPPORT_ACCOUNT_USERID';
        ctx = object({
          chat: { id: 'chatId' },
          from: { id: 'fromId' },
          message: { message_id: 'messageId' },
          reply: () => {},
          forwardMessage: () => {},
          telegram: { sendMessage: () => {} },
          session: { messagePurpose: { type: MessagePurposeType.SupportMessage } },
        });
        await captor.value(ctx, next);
      });

      it('should not pass', () => {
        assert.equal(next.mock.calls.length, 0);
      });

      it('should send notice message', () => {
        verify(ctx.telegram.sendMessage(
          'SUPPORT_ACCOUNT_USERID',
          new Format.FmtString(
            'Сообщение в поддержку от fromId',
            [{ type: 'code', offset: 25, length: 6 }],
          ),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'support_answer chatId messageId'),
          ]),
        ));
      });

      it('should forward message', () => {
        verify(ctx.forwardMessage('SUPPORT_ACCOUNT_USERID', 'chatId', 'messageId'));
      });

      it('should remove message purpose from session', () => {
        assert.deepEqual(ctx.session, {});
      });

      it('should reply', () => {
        verify(ctx.reply(matchers.isA(String)));
      });
    });
  });
});
