import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Format, Markup } from 'telegraf';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
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
   * При вызове действия ответа на сообщение в поддержку бот отправляет
   * сообщение-приглашение для отправки сообщения-ответа
   */
  bot.action(/^support_answer ([\d-]+) ([\d-]+)$/, (ctx) => {
    ctx.session.messagePurpose = {
      type: MessagePurposeType.SupportMessageAnswer,
      payload: {
        answerChatId: Number.parseInt(ctx.match[1]),
        answerToMessageId: Number.parseInt(ctx.match[2]),
      },
    };
    return sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Отправьте ответ, и я передам его',
      Markup.inlineKeyboard([
        Markup.button.callback('Не отправлять ответ', 'cancel_support_answer'),
      ]),
    );
  });

  bot.action(/^support_answer ([\d-]+) ([\w-]{36})$/, (ctx) => {
    ctx.session.messagePurpose = {
      type: MessagePurposeType.SupportMessageAnswer,
      payload: {
        answerChatId: Number.parseInt(ctx.match[1]),
        answerToQuoteId: ctx.match[2],
      },
    };
    return sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Отправьте ответ, и я передам его',
      Markup.inlineKeyboard([
        Markup.button.callback('Не отправлять ответ', 'cancel_support_answer'),
      ]),
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  /**
   * При получении сообщения от пользователя, если ожидается сообщение для отправки
   * ответа на сообщение в поддержку, копия полученного сообщения отправляется в исходный чат
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.SupportMessageAnswer) {
      const {
        answerChatId,
        answerToMessageId,
        answerToQuoteId,
      } = ctx.session.messagePurpose.payload;
      if (answerToMessageId || answerToQuoteId) {
        if (answerToMessageId) {
          await ctx.telegram.sendMessage(
            answerChatId,
            'Ответ от поддержки:',
            { reply_to_message_id: answerToMessageId },
          );
        } else if (answerToQuoteId) {

          const quote = inject(InjectionToken.LocalDatabase)('hub-message-data').get(answerToQuoteId);

          if (!quote) {
            return;
          }

          await ctx.telegram.sendMessage(
            answerChatId,
            Format.join(
              [
                new Format.FmtString(
                  quote,
                  [{ type: 'blockquote', offset: 0, length: quote.length }],
                ),
                'Ответ от поддержки:',
              ],
              '\n',
            ),
          );
        }

        await ctx.telegram.sendCopy(answerChatId, ctx.message);

        delete ctx.session.messagePurpose;
        return ctx.reply('Ответ отправлен!');
      }
    }

    return next();
  });
};

export default { configure, messageHandler };
