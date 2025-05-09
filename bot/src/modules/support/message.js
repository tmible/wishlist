import { Format, Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
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
   * При получении команды /support, запускающей процесс отправки сообщения в поддержку,
   * отправка сообщения-приглашения для отправки сообщения, которое будет переслано в поддержку
   */
  bot.command('support', async (ctx) => {
    ctx.session.messagePurpose = { type: MessagePurposeType.SupportMessage };

    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      `Напишите сообщение${
        isChatGroup(ctx) ? ' ответом на это' : ''
      }, и я передам его в поддержку`,
      Markup.inlineKeyboard([
        Markup.button.callback('Не отправлять сообщение', 'cancel_support_message'),
      ]),
    );
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  /**
   * При получении сообщения от пользователя, если ожидается сообщение
   * для отправки в поддержку, полученное сообщение пересылается в поддержку
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.SupportMessage) {

      await ctx.telegram.sendMessage(
        process.env.SUPPORT_ACCOUNT_USERID,
        Format.join(
          [
            'Сообщение в поддержку от',
            new Format.FmtString(
              `${ctx.from.id}`,
              [{ type: 'code', offset: 0, length: `${ctx.from.id}`.length }],
            ),
          ],
          ' ',
        ),
        Markup.inlineKeyboard([
          Markup.button.callback(
            'Ответить',
            `support_answer ${ctx.chat.id} ${ctx.message.message_id}`,
          ),
        ]),
      );

      await ctx.forwardMessage(
        process.env.SUPPORT_ACCOUNT_USERID,
        ctx.chat.id,
        ctx.message.message_id,
      );

      delete ctx.session.messagePurpose;
      return ctx.reply('Сообщение отправлено!');
    }

    return next();
  });
};

export const messageSupportFromIPCHub = async (ctx, userid, message, messageUUID) => {
  await ctx.telegram.sendMessage(
    process.env.SUPPORT_ACCOUNT_USERID,
    Format.join(
      [
        'Сообщение в поддержку от',
        new Format.FmtString(
          `${userid}`,
          [{ type: 'code', offset: 0, length: `${userid}`.length }],
        ),
      ],
      ' ',
    ),
    Markup.inlineKeyboard([
      Markup.button.callback(
        'Ответить',
        `support_answer ${userid} ${messageUUID}`,
      ),
    ]),
  );

  await ctx.telegram.sendMessage(process.env.SUPPORT_ACCOUNT_USERID, message);
};

export default { configure, messageHandler };
