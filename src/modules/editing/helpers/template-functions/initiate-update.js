import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {
 *   import('@tmible/wishlist-bot/constants/message-purpose-type').default
 * } MessagePurposeType
 */

/**
 * Запуск процесса обновления информации и подарке
 * Сохранение информации о назначении ожидаемого сообщения
 * и отправка сообщения-приглашения для обновления информации и подарке
 * @function initiateUpdate
 * @param {Context} ctx Контекст
 * @param {MessagePurposeType} messagePurposeType Тип назначения ожидаемого
 *   от пользователя сообщения
 * @param {Parameters<Context.reply>} reply Аргументы для отправки сообщения-приглашения
 * @async
 */
const initiateUpdate = async (ctx, messagePurposeType, reply) => {
  ctx.session.messagePurpose = {
    type: messagePurposeType,
    payload: ctx.match[1],
  };
  await sendMessageAndMarkItForMarkupRemove(ctx, 'reply', ...reply);
};

export default initiateUpdate;
