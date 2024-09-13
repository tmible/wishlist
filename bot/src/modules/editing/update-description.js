import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import sendList from './helpers/send-list.js';
import initiateUpdate from './helpers/template-functions/initiate-update.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleMessageHandler
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
          Markup.button.callback('Не обновлять описание', 'cancel_update_description'),
        ]),
      ],
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении сообщения от пользователя, если ожидается новое описание подарка,
   * текст полученного сообщения валидируется.
   * При провале валидации бот отправляет сообщение-уведомление об ошибке валидации.
   * При успехе валидации бот выпускает соответствующее событие, отправляет сообщение-уведомление
   *  об успехе сохранения нового описания подарка
   * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.UpdateDescription) {
      const itemId = ctx.session.messagePurpose.payload;

      delete ctx.session.messagePurpose;

      eventBus.emit(
        Events.Editing.UpdateItemDescription,
        itemId,
        ctx.message.text,
        ctx.message.entities,
      );

      await ctx.reply('Описание обновлено!');
      return sendList(eventBus, ctx);
    }

    return next();
  });
};

export default { configure, messageHandler };
