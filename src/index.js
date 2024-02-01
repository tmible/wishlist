import 'dotenv/config';
import { session, Telegraf } from 'telegraf';
import DefaultCommandSet from '@tmible/wishlist-bot/constants/default-command-set';
import GroupCommandSet from '@tmible/wishlist-bot/constants/group-command-set';
import configureModules from '@tmible/wishlist-bot/helpers/configure-modules';
import getSessionKey from '@tmible/wishlist-bot/helpers/get-session-key';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import forcePrivacyModeMiddleware from '@tmible/wishlist-bot/helpers/middlewares/force-privacy-mode';
import { removeLastMarkupMiddleware } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import AnonymousMessagesModule from '@tmible/wishlist-bot/modules/anonymous-messages';
import EditingModule from '@tmible/wishlist-bot/modules/editing';
import HelpModule from '@tmible/wishlist-bot/modules/help';
import WishlistModule from '@tmible/wishlist-bot/modules/wishlist';
import {
  initPersistentSession,
  dropPersistentSession,
  destroyPersistentSession,
} from '@tmible/wishlist-bot/session';
import { initStore, destroyStore } from '@tmible/wishlist-bot/store';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import getNickname from '@tmible/wishlist-bot/utils/get-nickname';

console.log('initializing store');
await initStore();

console.log('creating bot');
const bot = new Telegraf(process.env.BOT_TOKEN);

console.log('initializing session');
bot.use(session({ getSessionKey, defaultSession: () => ({}) }));
bot.use(initPersistentSession());

console.log('configuring bot');
bot.start(async (ctx) => {
  await ctx.telegram.setMyCommands(DefaultCommandSet, { scope: { type: 'default' }});
  await ctx.telegram.setMyCommands(GroupCommandSet, { scope: { type: 'all_group_chats' }});

  if (isChatGroup(ctx)) {
    return ctx.reply('Всем привет, всем здравствуйте!');
  }

  emit(Events.Usernames.StoreUsername, ctx.from.id, ctx.from.username ?? null);
  await dropPersistentSession(ctx);

  await ctx.sendMessage('Привет!');
  return ctx.reply('Рекомендую изучить полную справку, введя команду /help');
});

bot.on('message', Telegraf.groupChat(forcePrivacyModeMiddleware));
bot.on('message', removeLastMarkupMiddleware);
bot.action(/.*/, removeLastMarkupMiddleware);

bot.command('my_nickname', (ctx) => ctx.reply(
  getNickname(ctx.from.id),
  ...(isChatGroup(ctx) ? [{ reply_to_message_id: ctx.message.message_id }] : []),
));

configureModules(bot, [
  HelpModule,
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
  destroyStore(),
  await Promise.all([
    destroyPersistentSession(),
    bot.stop('SIGINT'),
  ]);
  process.exit();
});
process.once('SIGTERM', async () => {
  destroyStore(),
  await Promise.all([
    destroyPersistentSession(),
    bot.stop('SIGTERM'),
  ]);
  process.exit();
});
