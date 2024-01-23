const Events = Object.freeze({
  Wishlist: {
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
    CheckIfUseridIsPresent: 'usernames | check if userid is present',
    StoreUsername: 'usernames | store username',
  },
});

export default Events;
