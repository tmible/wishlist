import sendList from '../send-list.js';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('@tmible/wishlist-bot/architecture/event-bus').EventBus} EventBus
 * @typedef {
 *   import('@tmible/wishlist-bot/constants/message-purpose-type').default
 * } MessagePurposeType
 */

/**
 * Обновление информации и подарке
 * Если ожадается сообщение от пользователя, его текст валидируется.
 * При провале валидации бот отправляет сообщение-уведомления об ошибке валидации.
 * При успехе валидации бот выпускает соответствующее событие, отправляет сообщение-уведомление
 * об успехе сохранения новой информации о подарке
 * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 * @function updateValue
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {MessagePurposeType} messagePurposeType Тип назначения полученного
 *   от пользователя сообщения
 * @param {RegExp} valueRegExp Регулярное выражение для валидации
 * @param {string} errorMessage Текст сообщения-уведомления об ошибке валидации
 * @param {Event} event Событие для выпуска для сохранения новой информации
 * @param {string} successMessage Текст сообщения-уведомления об успехе обновления
 *   информации о подарке
 * @returns {Promise<void>}
 * @async
 */
const updateValue = async (
  eventBus,
  ctx,
  messagePurposeType,
  valueRegExp,
  errorMessage,
  event,
  successMessage,
) => {
  if (ctx.session.messagePurpose?.type !== messagePurposeType) {
    return;
  }

  const match = valueRegExp.exec(ctx.update.message.text);
  const itemId = ctx.session.messagePurpose.payload;

  delete ctx.session.messagePurpose;

  if (!match) {
    await ctx.reply(errorMessage);
    return;
  }

  eventBus.emit(event, itemId, match[0]);

  await ctx.reply(successMessage);
  await sendList(eventBus, ctx);
};

export default updateValue;
