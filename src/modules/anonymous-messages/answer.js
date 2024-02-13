import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import {
  sendMessageAndMarkItForMarkupRemove,
} from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

/**
 * При вызове действия ответа на анонимное сообщение бот отправляет
 * сообщение-приглашение для отправки сообщения-ответа
 */
const configure = (bot) => {
  bot.action(/^answer ([\-\d]+) ([\-\d]+)$/, (ctx) => {
    ctx.session.messagePurpose = {
      type: MessagePurposeType.AnonymousMessageAnswer,
      payload: {
        answerChatId: parseInt(ctx.match[1]),
        answerToMessageId: parseInt(ctx.match[2]),
      },
    };
    return sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Отправьте сообщение, и я перешлю его',
      Markup.inlineKeyboard([ Markup.button.callback('Не отправлять ответ', 'cancel_answer') ]),
    );
  });
};

/**
 * При получении сообщения от пользователя, если ожидается сообщение для отправки
 * ответа на анонимное сообщение, полученного сообщение пересылается в исходный чат
 */
const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.AnonymousMessageAnswer) {
      const { answerChatId, answerToMessageId } = ctx.session.messagePurpose.payload;
      await ctx.telegram.sendMessage(
        answerChatId,
        'Ответ:',
        { reply_to_message_id: answerToMessageId },
      );

      await ctx.forwardMessage(answerChatId, ctx.chat.id, ctx.message.message_id);

      delete ctx.session.messagePurpose;
      return ctx.reply('Ответ отправлен!');
    }

    return next();
  });
};

export default { configure, messageHandler };
