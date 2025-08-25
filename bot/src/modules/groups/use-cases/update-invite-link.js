import { emit } from '@tmible/wishlist-common/event-bus';
import Events from '@tmible/wishlist-bot/architecture/events';

/** @typedef {import('telegraf').Context} Context */

/**
 * Обновление пригласительной ссылки группы для кооперации по подарку
 * @function updateInviteLink
 * @param {number} wishlistItemId Идентификатор подарка
 * @param {string} link Пригласительная ссылка
 * @returns {void}
 */
const updateInviteLink = (wishlistItemId, link) => {
  emit(Events.Wishlist.SetWishlistItemGroupLink, wishlistItemId, link);
};

export default updateInviteLink;
