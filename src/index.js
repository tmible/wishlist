import 'dotenv/config';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { session, Telegraf } from 'telegraf';
import { DefaultCommandSet } from './constants/default-command-set.const.js';
import { DefaultHelpMessage } from './constants/default-help-message.const.js';
import { GroupCommandSet } from './constants/group-command-set.const.js';
import { GroupHelpMessage } from './constants/group-help-message.const.js';
import { TmibleCommandSet } from './constants/tmible-command-set.const.js';
import { TmibleId } from './constants/tmible-id.const.js';
import { configureAnonymousMessagesModule } from './modules/anonymous-messages.js';
import { configureEditingModule } from './modules/editing.js';
import { configureWishlistModule } from './modules/wishlist.js';

const db = await open({
  filename: process.env.WISHLIST_DB_FILE_PATH,
  driver: sqlite3.Database,
});

console.log('creating bot');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.start(async (ctx) => {
  ctx.telegram.setMyCommands(DefaultCommandSet, { scope: { type: 'default' }},);
  ctx.telegram.setMyCommands(GroupCommandSet, { scope: { type: 'all_group_chats' }});
  ctx.telegram.setMyCommands(TmibleCommandSet, { scope: { type: 'chat', chat_id: TmibleId }});

  if (ctx.update.message.chat.type === 'group') {
    return ctx.reply('Всем привет, всем здравствуйте!');
  }
  await ctx.sendMessage('Привет!');
  if (ctx.update.message.chat.id === TmibleId) {
    return;
  }
  return ctx.reply('Рекомендую изучить полную справку, введя команду /help');
});

bot.help((ctx) => ctx.replyWithMarkdownV2(
  ctx.update.message.chat.type === 'group' ? GroupHelpMessage : DefaultHelpMessage
));

configureWishlistModule(bot, db);
configureAnonymousMessagesModule(bot);
configureEditingModule(bot, db);

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
