import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { func, matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const emit = func();

const [
  isChatGroup,
  { sendMessageAndMarkItForMarkupRemove },
  { inject },
  sendList,
] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup'),
  replaceModule('@tmible/wishlist-bot/architecture/dependency-injector'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);

const ClearListModule = await import('../clear-list.js').then((module) => module.default);

describe('editing/clear-list module', () => {
  afterEach(reset);

  it('should register clear_list command handler', () => {
    const bot = object([ 'command' ]);
    ClearListModule.configure(bot);
    verify(bot.command('clear_list', matchers.isA(Function)));
  });

  describe('clear_list command handler if chat isn\'t group', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'command' ]);
      ctx = { session: {} };
      const captor = matchers.captor();
      ClearListModule.configure(bot);
      verify(bot.command('clear_list', captor.capture()));
      when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(ctx.session.messagePurpose, { type: MessagePurposeType.ClearList });
    });

    it('should reply', () => {
      verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        matchers.isA(String),
        Markup.inlineKeyboard([
          Markup.button.callback(matchers.isA(String), 'cancel_clear_list'),
        ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit });
    ClearListModule.messageHandler(bot);
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
      when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit });
      ClearListModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(() => {
        ctx = object({
          message: { text: 'text' },
          reply: () => {},
          session: { messagePurpose: { type: MessagePurposeType.ClearList } },
        });
      });

      it('should not pass', async () => {
        await captor.value(ctx, next);
        assert.equal(next.mock.calls.length, 0);
      });

      it('should remove message purpose from session', async () => {
        await captor.value(ctx, next);
        assert.deepEqual(ctx.session, {});
      });

      it('should reply if no ids found in message text', async () => {
        await captor.value(ctx, next);
        verify(ctx.reply(matchers.isA(String)));
      });

      describe('if any ids found in message text', () => {
        beforeEach(async () => {
          ctx.message.text = '1 2 3';
          await captor.value(ctx, next);
        });

        it('should emit delete event', () => {
          verify(emit(Events.Editing.DeleteItems, [ 1, 2, 3 ]));
        });

        it('should reply', () => {
          verify(ctx.reply(matchers.isA(String)));
        });

        it('should send list', () => {
          verify(sendList({ emit }, ctx));
        });
      });
    });
  });
});
