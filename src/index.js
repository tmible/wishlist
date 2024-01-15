import 'dotenv/config';
import { session, Telegraf } from 'telegraf';
import DefaultCommandSet from 'wishlist-bot/constants/default-command-set';
import DefaultHelpMessage from 'wishlist-bot/constants/default-help-message';
import GroupCommandSet from 'wishlist-bot/constants/group-command-set';
import GroupHelpMessage from 'wishlist-bot/constants/group-help-message';
import configureModules from 'wishlist-bot/helpers/configure-modules';
import { removeLastMarkupMiddleware } from 'wishlist-bot/helpers/remove-markup';
import AnonymousMessagesModule from 'wishlist-bot/modules/anonymous-messages';
import EditingModule from 'wishlist-bot/modules/editing';
import WishlistModule from 'wishlist-bot/modules/wishlist';
import { initStore, destroyStore } from 'wishlist-bot/store';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';

console.log('initializing store');

await initStore();

console.log('creating bot');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session({ defaultSession: () => ({}) }));

bot.start(async (ctx) => {
  ctx.telegram.setMyCommands(DefaultCommandSet, { scope: { type: 'default' }},);
  ctx.telegram.setMyCommands(GroupCommandSet, { scope: { type: 'all_group_chats' }});

  if (ctx.update.message.chat.type === 'group') {
    return ctx.reply('Всем привет, всем здравствуйте!');
  }

  if (!(await emit(Events.Usernames.CheckIfUsernameIsPresent, ctx.update.message.chat.id))) {
    await emit(
      Events.Usernames.StoreUsername,
      ctx.update.message.chat.id,
      ctx.update.message.chat.username ?? null,
    );
  }

  await ctx.sendMessage('Привет!');
  return ctx.reply('Рекомендую изучить полную справку, введя команду /help');
});

bot.help((ctx) => ctx.replyWithMarkdownV2(
  ctx.update.message.chat.type === 'group' ? GroupHelpMessage : DefaultHelpMessage
));

bot.on('message', removeLastMarkupMiddleware);
bot.action(/.*/, removeLastMarkupMiddleware);

configureModules(bot, [
  WishlistModule,
  AnonymousMessagesModule,
  EditingModule,
]);

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.launch();

console.log('bot started');

process.once('SIGINT', async () => {
  await Promise.all([
    destroyStore(),
    bot.stop('SIGINT'),
  ]);
  process.exit();
});
process.once('SIGTERM', async () => {
  await Promise.all([
    destroyStore(),
    bot.stop('SIGTERM'),
  ]);
  process.exit();
});
