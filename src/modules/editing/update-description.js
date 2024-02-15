import { Markup } from 'telegraf';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import ItemDescriptionPattern from './constants/item-description-pattern.const.js';
import sendList from './helpers/send-list.js';
import initiateUpdate from './helpers/template-functions/initiate-update.js';

/**
 * При вызове действия обновления описания подарка запуск
 * [стандартного механизма запуска процесса обновления информации о подарке]{@link initiateUpdate}
 */
const configure = (bot) => {
  bot.action(/^update_description ([\-\d]+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      MessagePurposeType.UpdateDescription,
      [
        'Отправьте мне новое описание (произвольный текст с переносами строк и форматированием)',
        Markup.inlineKeyboard([
          Markup.button.callback('🚫 Не обновлять описание', 'cancel_update_description'),
        ]),
      ],
    );
  });
};

/**
 * При получении сообщения от пользователя, если ожидается новое описание подарка,
 * текст полученного сообщения валидируется.
 * При провале валидации бот отправляет сообщение-уведомление об ошибке валидации.
 * При успехе валидации бот [выпускает]{@link emit} соответствующее событие,
 * отправляет сообщение-уведомление об успехе сохранения нового описания подарка
 * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 */
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
