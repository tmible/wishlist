import { Markup } from 'telegraf';
import ItemPriorityPattern from 'wishlist-bot/constants/item-priority-pattern';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import Events from 'wishlist-bot/store/events';
import initiateUpdate from '../helpers/template-functions/initiate-update.js';
import updateValue from '../helpers/template-functions/update-value.js';

const configure = (bot) => {
  bot.action(/^update_priority ([\-\d]+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      MessagePurposeType.UpdatePriority,
      [
        'Отправьте мне новое значение приоритета (целое число больше 0)',
        Markup.inlineKeyboard([
          Markup.button.callback('Не обновлять приоритет', 'cancel_update_priority'),
        ]),
      ],
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    await updateValue(
      ctx,
      MessagePurposeType.UpdatePriority,
      new RegExp(`^${ItemPriorityPattern}$`),
      'Ошибка в значении приоритета. Не могу обновить',
      Events.Editing.UpdateItemPriority,
      'Приоритет обновлён!',
    );

    return next();
  });
};

export default { configure, messageHandler };
