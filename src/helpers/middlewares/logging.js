import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import LoggingMiddlewareType from '@tmible/wishlist-bot/constants/logging-middleware-type';

/** @typedef {import('telegraf').Context} Context */

/**
 * Отображение [типа промежуточного обработчика]{@link LoggingMiddlewareType} в сообщения,
 * для добавления в лог
 * @constant {Map<LoggingMiddlewareType, string[]>}
 */
/* eslint-disable @stylistic/js/array-bracket-spacing --
  Пробелы для консистентности с другими элементами массива
*/
const MiddlewareTypeTostartAndFinishMessages = new Map([

  [ LoggingMiddlewareType.AUXILARY_ACTIVITIES, [ 'starting up', 'finished clean up' ] ],
  [ LoggingMiddlewareType.UPDATE_PROCESSING, [ 'start processing update', 'update processed' ] ],
]);
/* eslint-enable @stylistic/js/array-bracket-spacing */

/**
 * Обогащение сообщения информацией об обновлении
 * @function enrichLogMessage
 * @param {Context} ctx Контекст
 * @returns {{ updateType: string; updatePayload?: string }} Обогащение
 */
const enrichLogMessage = (ctx) => {
  const enrichment = {};

  if (ctx.updateType === 'message') {
    const commandEntity = ctx.message.entities?.find(({ type }) => type === 'bot_command');
    if (commandEntity) {
      enrichment.updateType = 'command';
      enrichment.updatePayload = ctx.message.text.slice(
        commandEntity.offset,
        commandEntity.offset + commandEntity.length,
      );
    } else {
      enrichment.updateType = 'text message';
    }
  } else if (ctx.updateType === 'callback_query') {
    enrichment.updateType = 'action';
    enrichment.updatePayload = ctx.callbackQuery.data;
  }

  return enrichment;
};

/**
 * Инициализация логгера, определение сообщений в зависимости от типа промежуточного
 * обработчика -- логгера и создание промежуточного обработчика.
 * Промежуточный обработчик добавляет в лог сообщения до и после вызова следующих промежуточных
 * обработчиков, обогощая их данными, зависящими от его типа
 * @function logging
 * @param {LoggingMiddlewareType} loggingMiddlewareType Тип создаваемого промежуточного обработчика
 * @returns {(ctx: Context, next: () => Promise<void>) => Promise<void>}
 *   Промежуточный обработчик -- логгер
 */
const logging = (loggingMiddlewareType) => {
  const logger = inject(InjectionToken.Logger);
  const [
    startMessage,
    finishMessage,
  ] = MiddlewareTypeTostartAndFinishMessages.get(loggingMiddlewareType);

  return async (ctx, next) => {
    let contextInfo = {
      chatId: ctx.chat.id,
      userid: ctx.from.id,
      updateId: ctx.update.update_id,
    };

    if (loggingMiddlewareType === LoggingMiddlewareType.UPDATE_PROCESSING) {
      contextInfo = { ...contextInfo, ...enrichLogMessage(ctx) };
    }

    logger.info(contextInfo, startMessage);

    await next();

    logger.info(contextInfo, finishMessage);
  };
};

export default logging;
