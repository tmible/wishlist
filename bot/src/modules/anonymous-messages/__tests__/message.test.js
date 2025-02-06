import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, reset, verify, when } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
      Пробелы для консистентности с другими элементами массива
    */
const [ getUseridFromInput, { sendMessageAndMarkItForMarkupRemove } ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/get-userid-from-input'),
  replaceModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup'),
]);
const MessageModule = await import('../message.js').then((module) => module.default);

describe('anonymous-messages/message module', () => {
  let ctx;
  let captor;

  afterEach(reset);

  it('should register message command handler', () => {
    const bot = object([ 'command' ]);
    MessageModule.configure(bot);
    verify(bot.command('message', matchers.isA(Function)));
  });

  const handleAnonymousMessageTestCases = [{
    name: 'should send notification message if there is no chat id',
    test: async (testContext) => {
      when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ null ]);
      const sendMessage = testContext.mock.fn();
      ctx.sendMessage = sendMessage;
      await captor.value(ctx);
      assert.deepEqual(
        sendMessage.mock.calls[0].arguments,
        [ 'Я не могу отправить сообщение этому адресату ☹️' ],
      );
    },
  }, {
    name: 'should save message purpose in session',
    test: async () => {
      when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ 'chatId' ]);
      await captor.value(ctx);
      assert.deepEqual(
        ctx.session,
        {
          messagePurpose: {
            type: MessagePurposeType.AnonymousMessage,
            payload: 'chatId',
          },
        },
      );
    },
  }, {
    name: 'should reply',
    test: async () => {
      when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ 'chatId' ]);
      await captor.value(ctx);
      verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        matchers.isA(String),
        Markup.inlineKeyboard([
          Markup.button.callback(matchers.isA(String), 'cancel_message'),
        ]),
      ));
    },
  }];

  describe('message command handler', () => {
    beforeEach(() => {
      const bot = object([ 'command' ]);
      captor = matchers.captor();
      MessageModule.configure(bot);
      verify(bot.command('message', captor.capture()));
    });

    describe('if there is no payload', () => {
      beforeEach(async () => {
        ctx = { chat: {}, session: {} };
        await captor.value(ctx);
      });

      it('should save message purpose in session', () => {
        assert.deepEqual(
          ctx.session.messagePurpose,
          { type: MessagePurposeType.AnonymousMessageRecieverUsername },
        );
      });

      it('should reply', () => {
        verify(sendMessageAndMarkItForMarkupRemove(
          ctx,
          'reply',
          matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'cancel_message'),
          ]),
        ));
      });
    });

    describe('if there is payload', () => {
      beforeEach(() => {
        ctx = { payload: 'payload', chat: {}, session: {} };
      });

      for (const { name, test } of handleAnonymousMessageTestCases) {
        it(name, test);
      }
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

    describe('if there is AnonymousMessageRecieverUsername message purpose in session', () => {
      beforeEach(() => {
        ctx = {
          chat: {},
          message: { text: 'text' },
          sendMessage: mock.fn(),
          session: {
            messagePurpose: {
              type: MessagePurposeType.AnonymousMessageRecieverUsername,
            },
          },
        };
      });

      afterEach(() => mock.reset());

      it('should not pass', async () => {
        when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ null ]);
        await captor.value(ctx, next);
        assert.equal(next.mock.calls.length, 0);
      });

      it('should remove message purpose from session', async () => {
        when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ null ]);
        await captor.value(ctx, next);
        assert.deepEqual(ctx.session, {});
      });

      for (const { name, test } of handleAnonymousMessageTestCases) {
        it(name, test);
      }
    });

    describe('if there is AnonymousMessage message purpose in session', () => {
      beforeEach(async () => {
        ctx = object({
          chat: { id: 'chatId' },
          message: { message_id: 'messageId' },
          reply: () => {},
          telegram: { sendCopy: () => {} },
          session: {
            messagePurpose: {
              type: MessagePurposeType.AnonymousMessage,
              payload: 123,
            },
          },
        });
        await captor.value(ctx, next);
      });

      it('should not pass', () => {
        assert.equal(next.mock.calls.length, 0);
      });

      it('should send message copy', () => {
        verify(ctx.telegram.sendCopy(
          123,
          ctx.message,
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'answer chatId messageId'),
          ]),
        ));
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
