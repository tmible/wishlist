import { emit } from '@tmible/wishlist-common/event-bus';
import sendList from '../wishlist/helpers/send-list.js';
import bindGroup from './use-cases/bind.js';

/** @typedef {import('telegraf').Context} Context */

// Заменить импорт sendList на выпуск события после переписывания на чистую архитектуру

/**
 * Обработчик действия привязки группы. Привязывает и обновляет список,
 * чтобы ссылка на группу появилась в чате
 * @function bindGroupActionHandler
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const bindGroupActionHandler = async (ctx) => {
  const wishlistItemId = Number.parseInt(ctx.match[1]);
  await bindGroup(ctx, wishlistItemId);
  await sendList({ emit }, ctx, Number.parseInt(ctx.match[2]));
};

export default bindGroupActionHandler;
