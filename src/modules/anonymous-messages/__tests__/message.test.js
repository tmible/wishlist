import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('anonymous-messages/message module', () => {
  let getUseridFromInput;
  let sendMessageAndMarkItForMarkupRemove;
  let MessageModule;
  let ctx;
  let captor;

  beforeEach(async () => {
    [ getUseridFromInput, { sendMessageAndMarkItForMarkupRemove } ] = await Promise.all([
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/get-userid-from-input',
        ))).default
      )(),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup')),
    ]);
    MessageModule = (await import('../message.js')).default;
  });

  afterEach(() => td.reset());

  it('should register message command handler', () => {
    const bot = td.object([ 'command' ]);
    MessageModule.configure(bot);
    td.verify(bot.command('message', td.matchers.isA(Function)));
  });

  const handleAnonymousMessageTestCases = [{
    name: 'should send notification message if there is no chat id',
    test: async (testContext) => {
      td.when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ null ]);
      const sendMessage = testContext.mock.fn(async () => {});
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
      td.when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ 'chatId' ]);
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
      td.when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ 'chatId' ]);
      await captor.value(ctx);
      td.verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        td.matchers.isA(String),
        Markup.inlineKeyboard([
          Markup.button.callback(td.matchers.isA(String), 'cancel_message'),
        ]),
      ));
    },
  }];

  describe('message command handler', () => {
    beforeEach(async () => {
      const bot = td.object([ 'command' ]);
      captor = td.matchers.captor();
      MessageModule.configure(bot);
      td.verify(bot.command('message', captor.capture()));
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
        td.verify(sendMessageAndMarkItForMarkupRemove(
          ctx,
          'reply',
          td.matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(td.matchers.isA(String), 'cancel_message'),
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
    const bot = td.object([ 'on' ]);
    MessageModule.messageHandler(bot);
    td.verify(bot.on('message', td.matchers.isA(Function)));
  });

  describe('message handler', () => {
    let next;

    beforeEach(() => {
      const bot = td.object([ 'on' ]);
      next = mock.fn(async () => {});
      captor = td.matchers.captor();
      MessageModule.messageHandler(bot);
      td.verify(bot.on('message', captor.capture()));
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
          sendMessage: mock.fn(async () => {}),
          session: {
            messagePurpose: {
              type: MessagePurposeType.AnonymousMessageRecieverUsername,
            },
          },
        };
      });

      afterEach(() => mock.reset());

      it('should not pass', async () => {
        td.when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ null ]);
        await captor.value(ctx, next);
        assert.equal(next.mock.calls.length, 0);
      });

      it('should remove message purpose from session', async () => {
        td.when(getUseridFromInput(), { ignoreExtraArgs: true }).thenReturn([ null ]);
        await captor.value(ctx, next);
        assert.deepEqual(ctx.session, {});
      });

      for (const { name, test } of handleAnonymousMessageTestCases) {
        it(name, test);
      }
    });

    describe('if there is AnonymousMessage message purpose in session', () => {
      beforeEach(async () => {
        ctx = td.object({
          chat: { id: 'chatId' },
          message: { message_id: 'messageId' },
          reply: () => {},
          telegram: { sendCopy: () => {} },
          session: {
            messagePurpose: {
              type: MessagePurposeType.AnonymousMessage,
              payload: '123',
            },
          },
        });
        await captor.value(ctx, next);
      });

      it('should not pass', () => {
        assert.equal(next.mock.calls.length, 0);
      });

      it('should send message copy', () => {
        td.verify(ctx.telegram.sendCopy(
          123,
          ctx.message,
          Markup.inlineKeyboard([ Markup.button.callback(td.matchers.isA(String), 'answer chatId messageId') ]),
        ));
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
