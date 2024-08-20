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
  },
  Editing: {
    GetList: 'editing | get list',
    AddItem: 'editing | add item',
    UpdateItemPriority: 'editing | update item priority',
    UpdateItemName: 'editing | update item name',
    UpdateItemDescription: 'editing | update item description',
    DeleteItems: 'editing | delete items',
  },
  Usernames: {
    GetUseridByUsername: 'usernames | get userid by username',
    GetUsernameByUserid: 'usernames | get username by userid',
    GetUseridAndUsernameIfPresent: 'usernames | get userid and username if present',
    StoreUsername: 'usernames | store username',
  },
});

export default Events;
