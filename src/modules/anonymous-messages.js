import { Markup } from 'telegraf';
import { TmibleId } from '../constants.js';

export const configureAnonymousMessagesModule = (bot) => {
  console.log('configuring anonymous messages module');

  bot.command('message', (ctx) => {
    if (ctx.update.message.chat.id === TmibleId) {
      return;
    }

    ctx.session = { ...ctx.session, sendMessageAnonymously: true };
    return ctx.reply(`Напишите сообщение${
      ctx.update.message.chat.type === 'group' ? ' ответом на это' : ''
    }, и я анонимно отправлю его`);
  });

  bot.command('cancel_message', (ctx) => {
    if (ctx.update.message.chat.id === TmibleId) {
      return;
    }

    if (!ctx.session?.sendMessageAnonymously) {
      return;
    }

    delete ctx.session.sendMessageAnonymously;
    return ctx.reply('Отправка сообщения отменена');
  });

  bot.action(/^answer ([\-\d]+) ([\-\d]+)$/, (ctx) => {
    ctx.session = { ...ctx.session, answerChatId: ctx.match[1], answerToMessageId: ctx.match[2] };
    return ctx.reply('Отправьте сообщение, и я перешлю его');
  });

  bot.command('cancel_answer', (ctx) => {
    if (ctx.update.message.chat.id !== TmibleId) {
      return;
    }

    if (!ctx.session?.answerChatId && !ctx.session?.answerToMessageId) {
      return;
    }

    delete ctx.session.answerChatId;
    delete ctx.session.answerToMessageId;
    return ctx.reply('Отправка ответа отменена');
  });

  bot.on('message', async (ctx, next) => {
    if (ctx.session?.answerChatId && ctx.session?.answerToMessageId) {
      await ctx.telegram.sendMessage(
        ctx.session.answerChatId,
        'Ответ:',
        { reply_to_message_id: ctx.session.answerToMessageId },
      );
      await ctx.forwardMessage(
        ctx.session.answerChatId,
        ctx.update.message.chat.id,
        ctx.update.message.message_id,
      );

      delete ctx.session.answerChatId;
      delete ctx.session.answerToMessageId;
      return ctx.reply('Ответ отправлен!');
    }

    if (ctx.session?.sendMessageAnonymously) {
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

    next();
  });
};
