import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('anonymous-messages/answer module', () => {
  let sendMessageAndMarkItForMarkupRemove;
  let AnswerModule;

  beforeEach(async () => {
    ({ sendMessageAndMarkItForMarkupRemove } =
      await td.replaceEsm(await resolveModule('wishlist-bot/helpers/middlewares/remove-markup'))
    );
    AnswerModule = (await import('../answer/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register answer action handler', () => {
    const bot = td.object([ 'action' ]);
    AnswerModule.configure(bot);
    td.verify(bot.action(/^answer ([\-\d]+) ([\-\d]+)$/, td.matchers.isA(Function)));
  });

  describe('answer action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'action' ]);
      ctx = { session: {}, match: [ null, 'match 1', 'match 2' ] };
      const captor = td.matchers.captor();
      AnswerModule.configure(bot);
      td.verify(bot.action(/^answer ([\-\d]+) ([\-\d]+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(
        ctx.session.messagePurpose,
        {
          type: MessagePurposeType.AnonymousMessageAnswer,
          payload: {
            answerChatId: 'match 1',
            answerToMessageId: 'match 2',
          },
        },
      );
    });

    it('should reply', () => {
      td.verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        td.matchers.isA(String),
        Markup.inlineKeyboard([ Markup.button.callback(td.matchers.isA(String), 'cancel_answer') ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    AnswerModule.messageHandler(bot);
    td.verify(bot.on('message', td.matchers.isA(Function)));
  });

  describe('message handler', () => {
    let ctx;
    let next;
    let captor;

    beforeEach(() => {
      const bot = td.object([ 'on' ]);
      next = mock.fn(async () => {});
      captor = td.matchers.captor();
      AnswerModule.messageHandler(bot);
      td.verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(async () => {
        ctx = td.object({
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
        td.verify(ctx.telegram.sendMessage(
          'answerChatId',
          td.matchers.isA(String),
          { reply_to_message_id: 'answerToMessageId' },
        ));
      });

      it('should forward answer', () => {
        td.verify(ctx.forwardMessage('answerChatId', 'chatId', 'messageId'));
      });

      it('should remove message purpose from session', () => {
        assert.deepEqual(ctx.session, {});
      });

      it('should reply', () => {
        td.verify(ctx.reply(td.matchers.isA(String)));
      });
    });
  });
});
