import 'dotenv/config';
import { session, Telegraf } from 'telegraf';
import DefaultCommandSet from 'wishlist-bot/constants/default-command-set';
import DefaultHelpMessage from 'wishlist-bot/constants/default-help-message';
import GroupCommandSet from 'wishlist-bot/constants/group-command-set';
import GroupHelpMessage from 'wishlist-bot/constants/group-help-message';
import configureModules from 'wishlist-bot/helpers/configure-modules';
import getNickname from 'wishlist-bot/helpers/get-nickname';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import forcePrivacyModeMiddleware from 'wishlist-bot/helpers/force-privacy-mode';
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
bot.use(session({ defaultSession: () => ({ lists: {} }) }));

bot.start(async (ctx) => {
  await ctx.telegram.setMyCommands(DefaultCommandSet, { scope: { type: 'default' }});
  await ctx.telegram.setMyCommands(GroupCommandSet, { scope: { type: 'all_group_chats' }});

  if (isChatGroup(ctx)) {
    return ctx.reply('Всем привет, всем здравствуйте!');
  }

  await emit(Events.Usernames.StoreUsername, ctx.from.id, ctx.from.username ?? null);

  await ctx.sendMessage('Привет!');
  return ctx.reply('Рекомендую изучить полную справку, введя команду /help');
});

bot.help((ctx) => ctx.replyWithMarkdownV2(
  isChatGroup(ctx) ? GroupHelpMessage : DefaultHelpMessage
));

bot.on('message', Telegraf.groupChat(forcePrivacyModeMiddleware));
bot.on('message', removeLastMarkupMiddleware);
bot.action(/.*/, removeLastMarkupMiddleware);

bot.command('my_nickname', (ctx) => ctx.reply(
  getNickname(ctx.from.id),
  ...(isChatGroup(ctx) ? [{ reply_to_message_id: ctx.message.message_id }] : []),
));

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
