import { Worker } from 'worker_threads';
import 'dotenv/config';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { session, Telegraf } from 'telegraf';
import { configureAnonymousMessagesModule } from './modules/anonymous-messages.js';
import {
  DefaultHelpMessage,
  GroupHelpMessage,
  DefaultCommandSet,
  GroupCommandSet,
  TmibleCommandSet,
} from './constants.js';
import { sendList, configureWishlistModule } from './modules/wishlist.js';

const db = await open({
  filename: process.env.WISHLIST_DB_FILE_PATH,
  driver: sqlite3.Database,
});

new Worker('./src/background.js');

console.log('creating bot');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.start(async (ctx) => {
  ctx.telegram.setMyCommands(DefaultCommandSet, { scope: { type: 'default' }},);
  ctx.telegram.setMyCommands(GroupCommandSet, { scope: { type: 'all_group_chats' }});
  ctx.telegram.setMyCommands(TmibleCommandSet, { scope: { type: 'chat', chat_id: 455852268 }});

  if (ctx.update.message.chat.type === 'group') {
    return ctx.reply('Всем привет, всем здравствуйте!');
  } else {
    await ctx.sendMessage('Привет!');
    if (ctx.update.message.chat.id === 455852268) {
      return;
    }
  }

  sendList(ctx, 'message', db);
});

bot.help((ctx) => ctx.replyWithMarkdownV2(
  ctx.update.message.chat.type === 'group' ? GroupHelpMessage : DefaultHelpMessage
));

configureWishlistModule(bot, db);
configureAnonymousMessagesModule(bot);

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.launch();

console.log('bot started');

process.once('SIGINT', async () => {
  await Promise.all([
    db.close(),
    bot.stop('SIGINT'),
  ]);
  process.exit();
});
process.once('SIGTERM', async () => {
  await Promise.all([
    db.close(),
    bot.stop('SIGTERM'),
  ]);
  process.exit();
});
