import {
  sendMessageAndMarkItForMarkupRemove,
} from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

/**
 * Запуск процесса обновления информации и подарке
 * Сохранение информации о назначении ожидаемого сообщения
 * и отправка сообщения-приглашения для обновления информации и подарке
 * @async
 * @function initiateUpdate
 * @param {Context} ctx Контекст
 * @param {MessagePurposeType} messagePurposeType Тип назначения ожидаемого от пользователя сообщения
 * @param {Parameters<Context.reply>} reply Аргументы для отправки сообщения-приглашения
 */
const initiateUpdate = async (ctx, messagePurposeType, reply) => {
  ctx.session.messagePurpose = {
    type: messagePurposeType,
    payload: ctx.match[1],
  };
  await sendMessageAndMarkItForMarkupRemove(ctx, 'reply', ...reply);
};

export default initiateUpdate;
