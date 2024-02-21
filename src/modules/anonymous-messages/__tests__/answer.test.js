import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('anonymous-messages/answer module', () => {
  let sendMessageAndMarkItForMarkupRemove;
  let AnswerModule;

  beforeEach(async () => {
    ({ sendMessageAndMarkItForMarkupRemove } = await resolveModule(
      '@tmible/wishlist-bot/helpers/middlewares/remove-markup',
    ).then((path) => replaceEsm(path)));
    AnswerModule = await import('../answer.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register answer action handler', () => {
    const bot = object([ 'action' ]);
    AnswerModule.configure(bot);
    verify(bot.action(/^answer ([\d-]+) ([\d-]+)$/, matchers.isA(Function)));
  });

  describe('answer action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'action' ]);
      ctx = { session: {}, match: [ null, '1', '2' ] };
      const captor = matchers.captor();
      AnswerModule.configure(bot);
      verify(bot.action(/^answer ([\d-]+) ([\d-]+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(
        ctx.session.messagePurpose,
        {
          type: MessagePurposeType.AnonymousMessageAnswer,
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
        Markup.inlineKeyboard([ Markup.button.callback(matchers.isA(String), 'cancel_answer') ]),
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
      next = mock.fn(async () => {});
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
          message: { message_id: 'messageId' },
          forwardMessage: () => {},
          reply: () => {},
          telegram: { sendMessage: () => {} },
          session: {
            messagePurpose: {
              type: MessagePurposeType.AnonymousMessageAnswer,
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

      it('should forward answer', () => {
        verify(ctx.forwardMessage('answerChatId', 'chatId', 'messageId'));
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
