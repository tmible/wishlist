/**
 * Перечисление типов назначения ожидаемого от пользователя сообщения
 * @enum {number}
 */
const MessagePurposeType = Object.freeze({
  WishlistOwnerUsername: 0,
  AddItemToWishlist: 1,
  ClearList: 2,
  UpdateName: 3,
  UpdatePriority: 4,
  UpdateDescription: 5,
  AnonymousMessageRecieverUsername: 6,
  AnonymousMessage: 7,
  AnonymousMessageAnswer: 8,
});

export default MessagePurposeType;
