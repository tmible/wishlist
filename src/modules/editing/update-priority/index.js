import Events from 'wishlist-bot/store/events';
import initiateUpdate from '../helpers/template-functions/initiate-update.js';
import updateValue from '../helpers/template-functions/update-value.js';

const configure = (bot) => {
  bot.action(/^update_priority ([\-\d]+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      'updatePriorityId',
      'Отправьте мне новое значение приоритета (целое число больше 0)\n' +
      'Если передумаете, используйте команду /cancel_update_priority',
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    await updateValue(
      ctx,
      'updatePriorityId',
      /^[\d]+$/,
      'Ошибка в значении приоритета. Не могу обновить',
      Events.Editing.UpdateItemPriority,
      'Приоритет обновлён!',
    );

    return next();
  });
};

export default { configure, messageHandler };
