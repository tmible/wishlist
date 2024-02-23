import { Markup } from 'telegraf';
import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import sendList from './helpers/send-list.js';

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
   * При получении комманды /clear_list, если чат не групповой, бот отправляет сообщение-приглашение
   * для отправки сообщения с идентификаторами подарков к удалению из списка желаний
   */
  bot.command('clear_list', async (ctx) => {
    if (isChatGroup(ctx)) {
      return;
    }

    ctx.session.messagePurpose = { type: MessagePurposeType.ClearList };
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Отправьте мне список id позиций, которые нужно удалить',
      Markup.inlineKeyboard([
        Markup.button.callback('🚫 Не очищать список', 'cancel_clear_list'),
      ]),
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении сообщения от пользователя, если ожидаются идентификаторы подарков
   * к удалению из списка желаний, бот вычленяет их из текста полученного сообщения.
   * При невозможности вычленить ни один идентификатор
   * бот отправляет сообщение-уведомления об ошибке.
   * При успехе вычленения бот выпускает соответствующее событие,  отправляет сообщение-уведомление
   * об успехе очищения списка
   * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.ClearList) {
      const ids = ctx.message.text
        .split(/\D+/)
        .filter((id) => !!id)
        .map((id) => Number.parseInt(id));
      delete ctx.session.messagePurpose;

      if (ids.length === 0) {
        return ctx.reply('Не могу найти ни одного id');
      }

      eventBus.emit(Events.Editing.DeleteItems, ids);

      await ctx.reply('Список очищен!');
      return sendList(eventBus, ctx);
    }

    return next();
  });
};

export default { configure, messageHandler };
