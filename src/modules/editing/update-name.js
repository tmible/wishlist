import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import Events from '@tmible/wishlist-bot/store/events';
import ItemNamePattern from './constants/item-name-pattern.const.js';
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
   * При вызове действия обновления названия подарка запуск
   * [стандартного механизма запуска процесса обновления информации о подарке]{@link initiateUpdate}
   */
  bot.action(/^update_name (\d+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      MessagePurposeType.UpdateName,
      [
        'Отправьте мне новое название (произвольный текст без переносов строк)',
        Markup.inlineKeyboard([
          Markup.button.callback('🚫 Не обновлять название', 'cancel_update_name'),
        ]),
      ],
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  /**
   * При получении сообщения от пользователя, если ожидается новое название подарка, запускается
   * [стандартный механизм валидации и сохранения новой информации о подарке]{@link updateValue}.
   */
  bot.on('message', async (ctx, next) => {
    await updateValue(
      ctx,
      MessagePurposeType.UpdateName,
      /* eslint-disable-next-line
        security/detect-non-literal-regexp,
        security-node/non-literal-reg-expr --
        Регулярное выражение из константы, так что тут нет уязвимости
      */
      new RegExp(`^${ItemNamePattern}$`),
      'Ошибка в названии. Не могу обновить',
      Events.Editing.UpdateItemName,
      'Название обновлено!',
    );

    return next();
  });
};

export default { configure, messageHandler };
