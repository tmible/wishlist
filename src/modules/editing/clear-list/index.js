import { Markup } from 'telegraf';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

/**
 * При получении комманды /clear_list, если чат не групповой, бот отправляет сообщение-приглашение
 * для отправки сообщения с идентификаторами подарков к удалению из списка желаний
 */
const configure = (bot) => {
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
        Markup.button.callback('Не очищать список', 'cancel_clear_list'),
      ]),
    );
  });
};

/**
 * При получении сообщения от пользователя, если ожидаются идентификаторы подарков
 * к удалению из списка желаний, бот вычленяет их из текста полученного сообщения.
 * При невозможности вычленить ни один идентификатор бот отправляет сообщение-уведомления об ошибке.
 * При успехе вычленения бот [выпускает]{@link emit} соответствующее событие,
 * отправляет сообщение-уведомление об успехе очищения списка
 * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 */
const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.ClearList) {
      const ids = ctx.message.text.split(/[^\d]+/).filter((id) => !!id);
      delete ctx.session.messagePurpose;

      if (ids.length === 0) {
        return ctx.reply('Не могу найти ни одного id');
      }

      emit(Events.Editing.DeleteItems, ids);

      await ctx.reply('Список очищен!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
