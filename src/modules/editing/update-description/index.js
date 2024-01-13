import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';
import initiateUpdate from '../helpers/template-functions/initiate-update.js';

const configure = (bot) => {
  bot.action(/^update_description ([\-\d]+)$/, async (ctx) => {
    await initiateUpdate(
      ctx,
      [ 'updateDescription', 'updateDescriptionId' ],
      'Отправьте мне новое описание (произвольный текст с переносами строк и форматированием)\n' +
      'Если передумаете, используйте команду /cancel_update_description',
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session?.updateDescription && ctx.session?.updateDescriptionId) {
      const match = /^[\s\S]+$/.exec(ctx.update.message.text);
      const itemId = ctx.session.updateDescriptionId;

      delete ctx.session.updateDescription;
      delete ctx.session.updateDescriptionId;

      if (!match) {
        return ctx.reply('Ошибка в описании. Не могу обновить');
      }

      await emit(Events.Editing.UpdateItemDescription, itemId, match[0]);
      await emit(
        Events.Editing.SaveItemDescriptionEntities,
        itemId,
        ctx.update.message.entities,
        0,
      );

      await ctx.reply('Описание обновлено!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
