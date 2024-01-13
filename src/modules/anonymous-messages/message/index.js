import { Markup } from 'telegraf';
import TmibleId from 'wishlist-bot/constants/tmible-id';

const configure = (bot) => {
  bot.command('message', (ctx) => {
    if (ctx.update.message.chat.id === TmibleId) {
      return;
    }

    ctx.session.sendMessageAnonymously = true;
    return ctx.reply(`Напишите сообщение${
      ctx.update.message.chat.type === 'group' ? ' ответом на это' : ''
    }, и я анонимно отправлю его`);
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.sendMessageAnonymously) {
      await ctx.telegram.sendCopy(
        TmibleId,
        ctx.update.message,
        Markup.inlineKeyboard([
          Markup.button.callback(
            'Ответить',
            `answer ${ctx.update.message.chat.id} ${ctx.update.message.message_id}`,
          ),
        ]),
      );

      delete ctx.session.sendMessageAnonymously;
      return ctx.reply('Сообщение отправлено!');
    }

    return next();
  });
};

export default { configure, messageHandler };
