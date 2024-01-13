import Events from 'wishlist-bot/store/events';
import initiateUpdate from '../helpers/template-functions/initiate-update.js';
import updateValue from '../helpers/template-functions/update-value.js';

const configure = (bot) => {
  bot.action(/^update_name ([\-\d]+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      'updateNameId',
      'Отправьте мне новое название (произвольный текст без переносов строк)\n' +
      'Если передумаете, используйте команду /cancel_update_name',
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    await updateValue(
      ctx,
      'updateNameId',
      /^.+$/,
      'Ошибка в названии. Не могу обновить',
      Events.Editing.UpdateItemName,
      'Название обновлено!',
    );

    return next();
  });
};

export default { configure, messageHandler };
