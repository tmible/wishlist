import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetUserHash } from '$lib/user/events.js';
import { LinkService } from '../injection-tokens.js';

/** @module Сценарий формирования и отправки ссылки на список желаний */

/**
 * Формирование и отправка ссылки
 * @function shareLink
 * @param {HTMLElement} currentTarget HTML элемент для анимации успешного копирования ссылки
 * @param {boolean} isLinkForGroups Признак формирования ссылки для групп
 * @returns {Promise<void>}
 * @async
 */
export const shareLink = async (currentTarget, isLinkForGroups) => {
  await inject(LinkService).shareLink(currentTarget, isLinkForGroups, await emit(GetUserHash));
};
