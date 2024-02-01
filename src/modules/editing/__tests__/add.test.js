import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/add module', () => {
  let isChatGroup;
  let sendMessageAndMarkItForMarkupRemove;
  let emit;
  let sendList;
  let AddModule;

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
    AddModule = (await import('../add.js')).default;
  });

  afterEach(() => td.reset());

  it('should register add command handler', () => {
    const bot = td.object([ 'command' ]);
    AddModule.configure(bot);
    td.verify(bot.command('add', td.matchers.isA(Function)));
  });

  describe('add command handler if chat isn\'t group', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'command' ]);
      ctx = { session: {} };
      const captor = td.matchers.captor();
      AddModule.configure(bot);
      td.verify(bot.command('add', captor.capture()));
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(ctx.session.messagePurpose, { type: MessagePurposeType.AddItemToWishlist });
    });

    it('should reply', () => {
      td.verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'replyWithMarkdownV2',
        td.matchers.isA(String),
        Markup.inlineKeyboard([ Markup.button.callback(td.matchers.isA(String), 'cancel_add') ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    AddModule.messageHandler(bot);
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
      AddModule.messageHandler(bot);
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
          from: { id: 'fromId' },
          message: { text: 'text', entities: [{ type: 'type', offset: 0, length: 0 }] },
          reply: () => {},
          session: { messagePurpose: { type: MessagePurposeType.AddItemToWishlist } },
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

      it('should reply if couldn\'t match message text and pattern', async () => {
        await captor.value(ctx, next);
        td.verify(ctx.reply(td.matchers.isA(String)));
      });

      describe('if message text matches pattern', () => {
        beforeEach(async () => {
          ctx.message.text = '1\nname\ndescription';
          await captor.value(ctx, next);
        });

        it('should emit add event', () => {
          td.verify(emit(
            Events.Editing.AddItem,
            [ 'fromId', '1', 'name', 'description' ],
            [{ type: 'type', offset: 0, length: 0 }],
            7,
          ));
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
