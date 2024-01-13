import TmibleId from 'wishlist-bot/constants/tmible-id';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('add', async (ctx) => {
    if (ctx.update.message.chat.id !== TmibleId) {
      return;
    }

    ctx.session.addItemToWishlist = true;
    await ctx.replyWithMarkdownV2(
      'Опишите подарок в формате:\n\n' +
      'приоритет\nназвание\nописание\n\n'+
      'и я добавлю его в список\\.\n' +
      'Если передумаете, используйте команду /cancel\\_add\n\n' +
      'Приоритет — целое число больше 0\n' +
      'Название — произвольный текст без переносов строк\n' +
      'Описание — произвольный текст с переносами строк и форматированием'
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.addItemToWishlist) {
      const match = /^([\d]+)\n(.+)\n([\s\S]+)$/.exec(ctx.update.message.text);

      delete ctx.session.addItemToWishlist;

      if (!match || match.length < 4) {
        return ctx.reply('Ошибка в описании подарка. Не могу добавить');
      }

      const descriptionOffset = match[1].length + match[2].length + 2;

      const { lastID } = await emit(Events.Editing.AddItem, match.slice(1));
      await emit(
        Events.Editing.SaveItemDescriptionEntities,
        lastID,
        ctx.update.message.entities,
        descriptionOffset,
      );

      await ctx.reply('Добавлено!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
