import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { Markup } from 'telegraf';
import { func, matchers, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [
  { emit },
  isChatGroup,
  { sendMessageAndMarkItForMarkupRemove },
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/event-bus'),
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup'),
]);
const bindGroup = await import('../bind.js').then((module) => module.default);

describe('groups / use cases / bind', () => {
  let ctx;

  beforeEach(() => {
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(true);
    when(
      emit(),
      { ignoreExtraArgs: true },
    ).thenReturn(
      ListItemState.COOPERATIVE,
      false,
      [ 'from id' ],
    );
    ctx = {
      session: {},
      match: [ null, null, '123' ],
      from: { id: 'from id' },
      getChat: func(),
      reply: func(),
    };
  });

  afterEach(reset);

  describe('if there is no invite link', () => {
    beforeEach(() => {
      when(ctx.getChat()).thenResolve({});
    });

    it('should send message', async () => {
      await bindGroup(ctx);
      verify(
        sendMessageAndMarkItForMarkupRemove(
          ctx,
          'reply',
          matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'cancel_bind_group'),
          ]),
        ),
      );
    });

    it('should await link', async () => {
      await bindGroup(ctx, 'wishlist item id');
      assert.deepEqual(
        ctx.session,
        {
          messagePurpose: {
            type: MessagePurposeType.InviteLink,
            payload: { wishlistItemId: 'wishlist item id', userid: 123 },
          },
        },
      );
    });
  });

  describe('if there is invite link', () => {
    beforeEach(() => {
      when(ctx.getChat()).thenResolve({ invite_link: 'invite link' });
    });

    it('should bind group', async () => {
      await bindGroup(ctx, 'wishlist item id');
      verify(emit(Events.Wishlist.SetWishlistItemGroupLink, 'wishlist item id', 'invite link'));
    });

    it('should reply', async () => {
      await bindGroup(ctx);
      verify(ctx.reply(matchers.isA(String)));
    });

    it('should send message', async () => {
      await bindGroup(ctx);
      verify(
        sendMessageAndMarkItForMarkupRemove(
          ctx,
          'reply',
          matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'cancel_bind_group'),
          ]),
        ),
      );
    });

    it('should await link', async () => {
      await bindGroup(ctx, 'wishlist item id');
      assert.deepEqual(
        ctx.session,
        {
          messagePurpose: {
            type: MessagePurposeType.InviteLink,
            payload: { wishlistItemId: 'wishlist item id', userid: 123 },
          },
        },
      );
    });
  });
});
