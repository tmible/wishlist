import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, reset, verify } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const { sendMessageAndMarkItForMarkupRemove } = await replaceModule(
  '@tmible/wishlist-bot/helpers/middlewares/remove-markup',
);
const AnswerModule = await import('../answer.js').then((module) => module.default);

describe('support / answer', () => {
  afterEach(reset);

  it('should register support_answer action handler', () => {
    const bot = object([ 'action' ]);
    AnswerModule.configure(bot);
    verify(bot.action(/^support_answer ([\d-]+) ([\d-]+)$/, matchers.isA(Function)));
  });

  describe('support_answer action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'action' ]);
      ctx = { session: {}, match: [ null, '1', '2' ] };
      const captor = matchers.captor();
      AnswerModule.configure(bot);
      verify(bot.action(/^support_answer ([\d-]+) ([\d-]+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(
        ctx.session.messagePurpose,
        {
          type: MessagePurposeType.SupportMessageAnswer,
          payload: {
            answerChatId: 1,
            answerToMessageId: 2,
          },
        },
      );
    });

    it('should reply', () => {
      verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        matchers.isA(String),
        Markup.inlineKeyboard([
          Markup.button.callback(matchers.isA(String), 'cancel_support_answer'),
        ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    AnswerModule.messageHandler(bot);
    verify(bot.on('message', matchers.isA(Function)));
  });

  describe('message handler', () => {
    let ctx;
    let next;
    let captor;

    beforeEach(() => {
      const bot = object([ 'on' ]);
      next = mock.fn();
      captor = matchers.captor();
      AnswerModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(async () => {
        ctx = object({
          chat: { id: 'chatId' },
          message: 'message',
          reply: () => {},
          telegram: { sendMessage: () => {}, sendCopy: () => {} },
          session: {
            messagePurpose: {
              type: MessagePurposeType.SupportMessageAnswer,
              payload: {
                answerChatId: 'answerChatId',
                answerToMessageId: 'answerToMessageId',
              },
            },
          },
        });
        await captor.value(ctx, next);
      });

      it('should not pass', () => {
        assert.equal(next.mock.calls.length, 0);
      });

      it('should send notification message', () => {
        verify(ctx.telegram.sendMessage(
          'answerChatId',
          matchers.isA(String),
          { reply_to_message_id: 'answerToMessageId' },
        ));
      });

      it('should send answer copy', () => {
        verify(ctx.telegram.sendCopy('answerChatId', 'message'));
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
