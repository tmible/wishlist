import { Markup } from 'telegraf';
import ItemDescriptionPattern from 'wishlist-bot/constants/item-description-pattern';
import ItemNamePattern from 'wishlist-bot/constants/item-name-pattern';
import ItemPriorityPattern from 'wishlist-bot/constants/item-priority-pattern';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('add', async (ctx) => {
    if (isChatGroup(ctx)) {
      return;
    }

    ctx.session.messagePurpose = { type: MessagePurposeType.AddItemToWishlist };
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'replyWithMarkdownV2',
      'Опишите подарок в формате:\n\n' +
      'приоритет\nназвание\nописание\n\n'+
      'и я добавлю его в список\\.\n\n' +
      'Приоритет — целое число больше 0\n' +
      'Название — произвольный текст без переносов строк\n' +
      'Описание — произвольный текст с переносами строк и форматированием',
      Markup.inlineKeyboard([ Markup.button.callback('Не добавлять', 'cancel_add') ]),
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.AddItemToWishlist) {
      const match = new RegExp(
        `^(${ItemPriorityPattern})\n(${ItemNamePattern})\n(${ItemDescriptionPattern})$`,
      ).exec(ctx.message.text);

      delete ctx.session.messagePurpose;

      if (!match || match.length < 4) {
        return ctx.reply('Ошибка в описании подарка. Не могу добавить');
      }

      const itemId = emit(
        Events.Editing.AddItem,
        [ ctx.from.id, ...match.slice(1) ],
        ctx.message.entities,
        match[1].length + match[2].length + 2,
      );

      await ctx.reply('Добавлено!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
