import { Markup } from 'telegraf';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import Events from 'wishlist-bot/store/events';
import initiateUpdate from '../helpers/template-functions/initiate-update.js';
import updateValue from '../helpers/template-functions/update-value.js';

const configure = (bot) => {
  bot.action(/^update_name ([\-\d]+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      MessagePurposeType.UpdateName,
      [
        'Отправьте мне новое название (произвольный текст без переносов строк)',
        Markup.inlineKeyboard([
          Markup.button.callback('Не обновлять название', 'cancel_update_name'),
        ]),
      ],
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    await updateValue(
      ctx,
      MessagePurposeType.UpdateName,
      /^.+$/,
      'Ошибка в названии. Не могу обновить',
      Events.Editing.UpdateItemName,
      'Название обновлено!',
    );

    return next();
  });
};

export default { configure, messageHandler };
