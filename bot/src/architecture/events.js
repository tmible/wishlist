/**
 * Набор событий для [подписки на них]{@link import('./event-bus.js').subscribe}
 * и [их выпуска]{@link import('./event-bus.js').emit} через шину событий
 */
const Events = Object.freeze({
  Wishlist: {
    HandleListLink: 'wishlist | handle list link',
    GetList: 'wishlist | get list',
    BookItem: 'wishlist | book item',
    CooperateOnItem: 'wishlist | cooperate on item',
    RetireFromItem: 'wishlist | retire from item',
    HandleOwnList: 'wishlist | handle own list',
    GetWishlistItemName: {},
    SetWishlistItemGroupLink: {},
    GetWishlistItemGroupLink: {},
    DeleteWishlistItemGroupLink: {},
    GetWishlistItemState: {},
    GetWishlistItemParticipants: {},
  },
  Editing: {
    GetList: 'editing | get list',
    DeleteItems: 'editing | delete items',
  },
  Usernames: {
    GetUseridByUsername: 'usernames | get userid by username',
    GetUsernameByUserid: 'usernames | get username by userid',
    GetUseridAndUsernameIfPresent: 'usernames | get userid and username if present',
    StoreUsername: 'usernames | store username',
    GetUserHash: 'usernames | get user hash',
    GetUseridAndUsernameByHash: 'usernames | get userid and username by hash',
  },
});

export default Events;
