import 'dotenv/config.js';
import { session, Telegraf } from 'telegraf';
import configureModules from '@tmible/wishlist-bot/architecture/configure-modules';
import { provide } from '@tmible/wishlist-bot/architecture/dependency-injector';
import { emit, subscribe } from '@tmible/wishlist-bot/architecture/event-bus';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import DefaultCommandSet from '@tmible/wishlist-bot/constants/default-command-set';
import GroupCommandSet from '@tmible/wishlist-bot/constants/group-command-set';
import getSessionKey from '@tmible/wishlist-bot/helpers/get-session-key';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import deleteMessagePurposeMiddleware from '@tmible/wishlist-bot/helpers/middlewares/delete-message-purpose';
import forcePrivacyModeMiddleware from '@tmible/wishlist-bot/helpers/middlewares/force-privacy-mode';
import { removeLastMarkupMiddleware } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import AnonymousMessagesModule from '@tmible/wishlist-bot/modules/anonymous-messages';
import EditingModule from '@tmible/wishlist-bot/modules/editing';
import HelpModule from '@tmible/wishlist-bot/modules/help';
import LinkModule from '@tmible/wishlist-bot/modules/link';
import WishlistModule from '@tmible/wishlist-bot/modules/wishlist';
import { dropPersistentSession, persistentSession } from '@tmible/wishlist-bot/persistent-session';
import autoUpdate from '@tmible/wishlist-bot/services/lists-auto-update';
import { closeLocalDB, getLocalDB } from '@tmible/wishlist-bot/services/local-db';
import initStore from '@tmible/wishlist-bot/store';
import getNickname from '@tmible/wishlist-bot/utils/get-nickname';

provide(InjectionToken.EventBus, { subscribe, emit });
provide(InjectionToken.LocalDatabase, getLocalDB);

console.log('initializing store');
const destroyStore = await initStore();

console.log('creating bot');
const bot = new Telegraf(process.env.BOT_TOKEN);

console.log('initializing session');
bot.use(session({ getSessionKey, defaultSession: () => ({}) }));
bot.use(persistentSession());

console.log('configuring bot');
bot.on('message', Telegraf.groupChat(forcePrivacyModeMiddleware), deleteMessagePurposeMiddleware);
bot.on([ 'message', 'callback_query' ], removeLastMarkupMiddleware, autoUpdate());

bot.start(async (ctx) => {
  await ctx.telegram.setMyCommands(DefaultCommandSet, { scope: { type: 'default' } });
  await ctx.telegram.setMyCommands(GroupCommandSet, { scope: { type: 'all_group_chats' } });

  if (!isChatGroup(ctx)) {
    emit(Events.Usernames.StoreUsername, ctx.from.id, ctx.from.username ?? null);
  }

  if (ctx.startPayload) {
    return emit(Events.Wishlist.HandleListLink, ctx, ctx.startPayload);
  }

  await dropPersistentSession(ctx);

  if (isChatGroup(ctx)) {
    return ctx.reply('Всем привет, всем здравствуйте!');
  }

  await ctx.sendMessage('Привет!');
  return ctx.reply('Рекомендую изучить полную справку, введя команду /help');
});

bot.command('my_nickname', (ctx) => ctx.reply(
  getNickname(ctx.from.id),
  ...(isChatGroup(ctx) ? [{ reply_to_message_id: ctx.message.message_id }] : []),
));

configureModules(bot, [
  HelpModule,
  WishlistModule,
  AnonymousMessagesModule,
  EditingModule,
  LinkModule,
])(bot);

/* eslint-disable-next-line
  promise/prefer-await-to-callbacks,
  unicorn/prefer-top-level-await --
  Это не одноразовая функция обратного вызова, а обработчик
  для каждой такой ситуации с совпадающей сигнатурой
  bot -- не промис, просто совпадает название методов catch()
*/
bot.catch((err, ctx) => {
  console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.launch();

console.log('bot started');

process.once('SIGINT', async () => {
  destroyStore();
  await closeLocalDB();
  bot.stop('SIGINT');
});
process.once('SIGTERM', async () => {
  destroyStore();
  await closeLocalDB();
  bot.stop('SIGTERM');
});
