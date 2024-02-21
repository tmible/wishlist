import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import sendList from './helpers/send-list.js';
import initiateUpdate from './helpers/template-functions/initiate-update.js';

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
   * При вызове действия обновления описания подарка запуск
   * [стандартного механизма запуска процесса обновления информации о подарке]{@link initiateUpdate}
   */
  bot.action(/^update_description (\d+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      MessagePurposeType.UpdateDescription,
      [
        'Отправьте мне новое описание (произвольный текст с переносами строк и форматированием)',
        Markup.inlineKeyboard([
          Markup.button.callback('🚫 Не обновлять описание', 'cancel_update_description'),
        ]),
      ],
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  /**
   * При получении сообщения от пользователя, если ожидается новое описание подарка,
   * текст полученного сообщения валидируется.
   * При провале валидации бот отправляет сообщение-уведомление об ошибке валидации.
   * При успехе валидации бот [выпускает]{@link emit} соответствующее событие,
   * отправляет сообщение-уведомление об успехе сохранения нового описания подарка
   * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.UpdateDescription) {
      const itemId = ctx.session.messagePurpose.payload;

      delete ctx.session.messagePurpose;

      emit(Events.Editing.UpdateItemDescription, itemId, ctx.message.text, ctx.message.entities);

      await ctx.reply('Описание обновлено!');
      return sendList(ctx);
    }

    return next();
  });
};

export default { configure, messageHandler };
