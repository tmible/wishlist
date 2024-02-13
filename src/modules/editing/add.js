import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import {
  sendMessageAndMarkItForMarkupRemove,
} from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import ItemDescriptionPattern from './constants/item-description-pattern.const.js';
import ItemNamePattern from './constants/item-name-pattern.const.js';
import ItemPriorityPattern from './constants/item-priority-pattern.const.js';
import sendList from './helpers/send-list.js';

/**
 * При получении команды /add, если чат не групповой, бот отправляет сообщение-приглашение
 * для отправки сообщения с информацией о подарке, добавляемом в список желаний
 */
const configure = (bot) => {
  bot.command('add', async (ctx) => {
    if (isChatGroup(ctx)) {
      return;
    }

    ctx.session.messagePurpose = { type: MessagePurposeType.AddItemToWishlist };
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'replyWithMarkdownV2',
      'Опишите подарок в формате:\n' +
      '>приоритет\n>название\n>описание\n' +
      'Приоритет и описание можно не указывать',
      Markup.inlineKeyboard([ Markup.button.callback('Не добавлять', 'cancel_add') ]),
    );
  });
};

/**
 * При получении сообщения от пользователя, если ожидается информация о подарке,
 * добавляемом в список желаний, бот валидирует текст полученного сообщения.
 * При провале валидации бот отправляет сообщение-уведомления об ошибке валидации.
 * При успехе валидации бот [выпускает]{@link emit} соответствующее событие,
 * отправляет сообщение-уведомление об успехе добавления подарка
 * и [отправляет обновлённый список]{@link sendList}
 */
const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.AddItemToWishlist) {
      const match = new RegExp(
        `^((${ItemPriorityPattern})\n)?(${ItemNamePattern})(\n(${ItemDescriptionPattern}))?$`,
      ).exec(ctx.message.text);

      delete ctx.session.messagePurpose;

      if (!match || match.length < 6) {
        return ctx.reply(
          'Ошибка в описании подарка. Проверьте, что:\n' +
          'Приоритет — целое число больше 0\n' +
          'Название — произвольный текст без переносов строк\n' +
          'Описание — произвольный текст с переносами строк и форматированием',
        );
      }

      emit(
        Events.Editing.AddItem,
        [ ctx.from.id, parseInt(match[2] ?? '1'), match[3], match[5] ?? '' ],
        ctx.message.entities,
        (match[1] ?? '').length + match[3].length + 1,
      );

      await ctx.reply('Добавлено!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
