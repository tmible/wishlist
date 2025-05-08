import numericEnum from '@tmible/wishlist-common/numeric-enum';

/**
 * Перечисление типов назначения ожидаемого от пользователя сообщения
 * @enum {number}
 */
const MessagePurposeType = numericEnum([
  'WishlistOwnerUsername',
  'AnonymousMessageRecieverUsername',
  'AnonymousMessage',
  'AnonymousMessageAnswer',
  'SupportMessage',
  'SupportMessageAnswer',
]);

export default MessagePurposeType;
