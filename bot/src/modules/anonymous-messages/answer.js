import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

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
   * При вызове действия ответа на анонимное сообщение бот отправляет
   * сообщение-приглашение для отправки сообщения-ответа
   */
  bot.action(/^answer ([\d-]+) ([\d-]+)$/, (ctx) => {
    ctx.session.messagePurpose = {
      type: MessagePurposeType.AnonymousMessageAnswer,
      payload: {
        answerChatId: Number.parseInt(ctx.match[1]),
        answerToMessageId: Number.parseInt(ctx.match[2]),
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

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  /**
   * При получении сообщения от пользователя, если ожидается сообщение для отправки
   * ответа на анонимное сообщение, полученного сообщение пересылается в исходный чат
   */
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
