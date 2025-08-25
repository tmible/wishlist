import { emit } from '@tmible/wishlist-common/event-bus';
import sendList from '../wishlist/helpers/send-list.js';
import createGroup from './use-cases/create.js';

/** @typedef {import('telegraf').Context} Context */

// Заменить импорт sendList на выпуск события после переписывания на чистую архитектуру

/**
 * Обработчик действия создания группы. Создаёт группу и обновляет список,
 * чтобы ссылка на группу появилась в чате
 * @function createGroupActionHandler
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const createGroupActionHandler = async (ctx) => {
  const wishlistItemId = Number.parseInt(ctx.match[1]);
  await createGroup(wishlistItemId);
  await sendList({ emit }, ctx, Number.parseInt(ctx.match[2]));
};

export default createGroupActionHandler;
