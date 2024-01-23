import { Markup } from 'telegraf';
import ItemDescriptionPattern from 'wishlist-bot/constants/item-description-pattern';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';
import initiateUpdate from '../helpers/template-functions/initiate-update.js';

const configure = (bot) => {
  bot.action(/^update_description ([\-\d]+)$/, async (ctx) => {
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

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.UpdateDescription) {
      const match = new RegExp(`^${ItemDescriptionPattern}$`).exec(ctx.message.text);
      const itemId = ctx.session.messagePurpose.payload;

      delete ctx.session.messagePurpose;

      if (!match) {
        return ctx.reply('Ошибка в описании. Не могу обновить');
      }

      emit(Events.Editing.UpdateItemDescription, itemId, match[0], ctx.message.entities);

      await ctx.reply('Описание обновлено!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
