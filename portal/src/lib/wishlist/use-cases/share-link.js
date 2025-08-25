import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { GetUserHash } from '$lib/user/events.js';
import { LinkService } from '../injection-tokens.js';

/** @module Сценарий формирования и отправки ссылки на список желаний */

/**
 * Формирование и отправка ссылки
 * @function shareLink
 * @param {boolean} isLinkForGroups Признак формирования ссылки для групп
 * @returns {Promise<void>}
 * @async
 */
export const shareLink = async (isLinkForGroups) => {
  await inject(LinkService).shareLink(isLinkForGroups, await emit(GetUserHash));
};
