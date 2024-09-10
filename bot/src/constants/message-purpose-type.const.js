import numericEnum from '@tmible/wishlist-common/numeric-enum';

/**
 * Перечисление типов назначения ожидаемого от пользователя сообщения
 * @enum {number}
 */
const MessagePurposeType = numericEnum([
  'WishlistOwnerUsername',
  'AddItemToWishlist',
  'UpdateName',
  'UpdatePriority',
  'UpdateDescription',
  'AnonymousMessageRecieverUsername',
  'AnonymousMessage',
  'AnonymousMessageAnswer',
]);

export default MessagePurposeType;
