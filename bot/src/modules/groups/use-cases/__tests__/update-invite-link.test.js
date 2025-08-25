import { describe, it } from 'node:test';
import { verify } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const { emit } = await replaceModule('@tmible/wishlist-common/event-bus');
const updateInviteLink = await import('../update-invite-link.js').then((module) => module.default);

describe('groups / use cases / update invite link', () => {
  it('should update invite link ', () => {
    updateInviteLink('wishlistItemId', 'link');
    verify(emit(Events.Wishlist.SetWishlistItemGroupLink, 'wishlistItemId', 'link'));
  });
});
