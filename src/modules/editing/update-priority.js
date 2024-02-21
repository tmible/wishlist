import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import Events from '@tmible/wishlist-bot/store/events';
import ItemPriorityPattern from './constants/item-priority-pattern.const.js';
import initiateUpdate from './helpers/template-functions/initiate-update.js';
import updateValue from './helpers/template-functions/update-value.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/configure-modules').ModuleMessageHandler
 * } ModuleMessageHandler
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия обновления приоритета подарка запуск
   * [стандартного механизма запуска процесса обновления информации о подарке]{@link initiateUpdate}
   */
  bot.action(/^update_priority (\d+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      MessagePurposeType.UpdatePriority,
      [
        'Отправьте мне новое значение приоритета (целое число больше 0)',
        Markup.inlineKeyboard([
          Markup.button.callback('🚫 Не обновлять приоритет', 'cancel_update_priority'),
        ]),
      ],
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  /**
   * При получении сообщения от пользователя, если ожидается новый приоритет подарка, запускается
   * [стандартный механизм валидации и сохранения новой информации о подарке]{@link updateValue}.
   */
  bot.on('message', async (ctx, next) => {
    await updateValue(
      ctx,
      MessagePurposeType.UpdatePriority,
      /* eslint-disable-next-line
        security/detect-non-literal-regexp,
        security-node/non-literal-reg-expr --
        Регулярное выражение из константы, так что тут нет уязвимости
      */
      new RegExp(`^${ItemPriorityPattern}$`),
      'Ошибка в значении приоритета. Не могу обновить',
      Events.Editing.UpdateItemPriority,
      'Приоритет обновлён!',
    );

    return next();
  });
};

export default { configure, messageHandler };
