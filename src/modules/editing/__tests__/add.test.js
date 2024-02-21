import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import Events from '@tmible/wishlist-bot/store/events';

const [
  isChatGroup,
  { sendMessageAndMarkItForMarkupRemove },
  { emit },
  sendList,
] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup'),
  replaceModule('@tmible/wishlist-bot/store/event-bus'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);
const AddModule = await import('../add.js').then((module) => module.default);

describe('editing/add module', () => {
  afterEach(reset);

  it('should register add command handler', () => {
    const bot = object([ 'command' ]);
    AddModule.configure(bot);
    verify(bot.command('add', matchers.isA(Function)));
  });

  describe('add command handler if chat isn\'t group', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'command' ]);
      ctx = { session: {} };
      const captor = matchers.captor();
      AddModule.configure(bot);
      verify(bot.command('add', captor.capture()));
      when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      await captor.value(ctx);
    });

    it('should save message purpose in session', () => {
      assert.deepEqual(ctx.session.messagePurpose, { type: MessagePurposeType.AddItemToWishlist });
    });

    it('should reply', () => {
      verify(sendMessageAndMarkItForMarkupRemove(
        ctx,
        'replyWithMarkdownV2',
        matchers.isA(String),
        Markup.inlineKeyboard([ Markup.button.callback(matchers.isA(String), 'cancel_add') ]),
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    AddModule.messageHandler(bot);
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
      AddModule.messageHandler(bot);
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
        ctx.message.text = '';
        await captor.value(ctx, next);
        verify(ctx.reply(matchers.isA(String)));
      });

      describe('if message text matches pattern', () => {
        beforeEach(async () => {
          ctx.message.text = '1\nname\ndescription';
          await captor.value(ctx, next);
        });

        it('should emit add event', () => {
          verify(emit(
            Events.Editing.AddItem,
            [ 'fromId', 1, 'name', 'description' ],
            [{ type: 'type', offset: 0, length: 0 }],
            7,
          ));
        });

        it('should reply', () => {
          verify(ctx.reply(matchers.isA(String)));
        });

        it('should send list', () => {
          verify(sendList(ctx));
        });
      });
    });
  });
});
