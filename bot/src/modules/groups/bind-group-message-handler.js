import { emit } from '@tmible/wishlist-common/event-bus';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import sendList from '../wishlist/helpers/send-list.js';
import updateInviteLink from './use-cases/update-invite-link.js';

/** @typedef {import('telegraf').Context} Context */

// Заменить импорт sendList на выпуск события после переписывания на чистую архитектуру

/**
 * Обработчик сообщения от пользователя. Если ожидается пригласительная ссылка для привязки группы
 * к подарку, ссылка обновляется на текст сообщения.
 * @function bindGroupMessageHandler
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 * @returns {Promise<void>}
 * @async
 */
const bindGroupMessageHandler = async (ctx, next) => {
  if (ctx.session.messagePurpose?.type === MessagePurposeType.InviteLink) {
    updateInviteLink(
      Number.parseInt(ctx.session.messagePurpose.payload.wishlistItemId),
      ctx.message.text,
    );
    const { userid } = ctx.session.messagePurpose.payload;
    delete ctx.session.messagePurpose;
    await ctx.reply(`Группа привязана со ссылкой ${ctx.message.text}!`);
    return sendList({ emit }, ctx, userid);
  }

  return next();
};

export default bindGroupMessageHandler;
