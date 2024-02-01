import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/clear-list module', () => {
  let isChatGroup;
  let sendMessageAndMarkItForMarkupRemove;
  let emit;
  let sendList;
  let ClearListModule;

  beforeEach(async () => {
    [
      isChatGroup,
      { sendMessageAndMarkItForMarkupRemove },
      { emit },
      sendList,
    ] = await Promise.all([
      (async () =>
        (await td.replaceEsm(await resolveModule('@tmible/wishlist-bot/helpers/is-chat-group'))).default
      )(),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup')),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    ClearListModule = (await import('../clear-list.js')).default;
  });

  afterEach(() => td.reset());

  it('should register clear_list command handler', () => {
    const bot = td.object([ 'command' ]);
    ClearListModule.configure(bot);
    td.verify(bot.command('clear_list', td.matchers.isA(Function)));
  });

  describe('clear_list command handler if chat isn\'t group', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'command' ]);
      ctx = { session: {} };
      const captor = td.matchers.captor();
      ClearListModule.configure(bot);
      td.verify(bot.command('clear_list', captor.capture()));
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(ctx.session.messagePurpose, { type: MessagePurposeType.ClearList });
    });

    it('should reply', () => {
      td.verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        td.matchers.isA(String),
        Markup.inlineKeyboard([
          Markup.button.callback(td.matchers.isA(String), 'cancel_clear_list')
        ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    ClearListModule.messageHandler(bot);
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
      ClearListModule.messageHandler(bot);
      td.verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(() => {
        ctx = td.object({
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
        td.verify(ctx.reply(td.matchers.isA(String)));
      });

      describe('if any ids found in message text', () => {
        beforeEach(async () => {
          ctx.message.text = '1 2 3';
          await captor.value(ctx, next);
        });

        it('should emit delete event', () => {
          td.verify(emit(Events.Editing.DeleteItems, [ '1', '2', '3' ]));
        });

        it('should reply', () => {
          td.verify(ctx.reply(td.matchers.isA(String)));
        });

        it('should send list', () => {
          td.verify(sendList(ctx));
        });
      });
    });
  });
});
