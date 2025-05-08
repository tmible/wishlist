import { randomUUID } from 'node:crypto';
import { emit } from '@tmible/wishlist-common/event-bus';
import {
  UNKNOWN_USER_UUID_COOKIE_NAME,
} from '$lib/constants/unknown-user-uuid-cookie-name.const.js';
import { AddAction } from '../events.js';

/** @module Сценарий добавления действия */

/**
 * Установка unknownUserUuid при необходимости и добавление действия
 * @function addAction
 * @param {number} timestamp Таймштамп действия
 * @param {string} action Деёствие
 * @param {import('./$types').Cookies} cookies Cookie файлы запроса и ответа
 * @returns {void}
 */
export const addAction = (
  timestamp,
  action,
  cookies,
) => {
  let unknownUserUuid = cookies.get(UNKNOWN_USER_UUID_COOKIE_NAME);
  if (unknownUserUuid === undefined) {
    unknownUserUuid = randomUUID();
    cookies.set(UNKNOWN_USER_UUID_COOKIE_NAME, unknownUserUuid, { path: '/' });
  }
  emit(AddAction, timestamp, action, unknownUserUuid);
};
