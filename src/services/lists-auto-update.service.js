import { Format } from 'telegraf';
import formMessages from '@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';
import { initPersistentSession } from '@tmible/wishlist-bot/persistent-session';
import { getLocalDB } from '@tmible/wishlist-bot/services/local-db';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').Chat} Chat
 * @typedef {import('classic-level').ClassicLevel} ClassicLevel
 */

/**
 * @module Сервис автоматического обновления списков желаний в чатах,
 * отличных от того в котором он был обновлён пользователем
 */

/**
 * Объект для доступа к БД
 * @type {ClassicLevel}
 */
let db;

/**
 * Инициализация [объекта для доступа к БД]{@link db}
 * @function startAutoUpdateService
 * @returns {void}
 */
export const startAutoUpdateService = () => db = getLocalDB('auto-update');

/**
 * Добавление чата в список автоматического обновления для списка желаний
 * @function addChatToAutoUpdate
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {{ id: number, type: string }} chat Добавляемый к автоматическому обновлению чат
 * @returns {Promise<void>}
 * @async
 */
const addChatToAutoUpdate = async (userid, chat) => {
  let current = [];
  try {
    current = await db.get(userid);
  } catch (e) {
    if (e.code !== 'LEVEL_NOT_FOUND') {
      throw e;
    }
  }
  if (new Set(current.map(({ id }) => id)).has(chat.id)) {
    return;
  }
  await db.put(userid, [ ...current, chat ]);
};

/**
 * Удаление чата из списка автоматического обновления для списка желаний
 * @function removeChatFromAutoUpdate
 * @param {number[]} userids Идентификаторы пользователей -- владельцев списков,
 *   которые были в удаляемом чате
 * @param {number} chatId Идентификатор удаляемого чата
 * @returns {Promise<void>}
 * @async
 */
const removeChatFromAutoUpdate = async (userids, chatId) => {
  const current = await db.getMany(userids);
  await db.batch(userids.map((userid, i) => ({
    type: 'put',
    key: userid,
    value: (current[i] ?? []).filter(({ id }) => id !== chatId),
  })));
};

/**
 * Проверка необходимости добавления и добавление чатов в список автоматического обновления.
 * Автоматически при запросе нового списка и вручную при ручном обновлении
 * @function checkChatsToAdd
 * @param {Context} ctx Контекст
 * @param {Set<number>} memoizedSet Множество идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в начале работы
 *   [промежуточного обработчика]{@link autoUpdateMiddleware}
 * @param {number[]} current Массив идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в конце работы
 *   [промежуточного обработчика]{@link autoUpdateMiddleware}
 * @returns {Promise<void>}
 * @async
 */
const checkChatsToAdd = async (ctx, memoizedSet, current) => {
  for (const userid of current) {
    if (memoizedSet.has(userid)) {
      continue;
    }
    delete ctx.state.autoUpdate?.userid;
    if (ctx.from.id === userid) {
      continue;
    }
    await addChatToAutoUpdate(userid, { id: ctx.chat.id, type: ctx.chat.type });
  }

  if (ctx.state.autoUpdate?.shouldAddChat) {
    await addChatToAutoUpdate(
      ctx.state.autoUpdate.shouldAddChat,
      { id: ctx.chat.id, type: ctx.chat.type },
    );
  }
};

/**
 * Проверка необходимости удаления и удаление чатов из списка автоматического обновления
 * @function checkChatsToRemove
 * @param {Context} ctx Контекст
 * @param {number[]} memoized Массив идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в начале работы
 *   [промежуточного обработчика]{@link autoUpdateMiddleware}
 * @param {Set<number>} currentSet Множество идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в конце работы
 *   [промежуточного обработчика]{@link autoUpdateMiddleware}
 * @returns {Promise<void>}
 * @async
 */
const checkChatsToRemove = async (ctx, memoized, currentSet) => {
  for (const userid of memoized) {
    if (currentSet.has(userid)) {
      continue;
    }
    await removeChatFromAutoUpdate(memoized, ctx.chat.id);
  }
};

/**
 * Создание искусственного контекста для отправки обновлений в другой чат
 * @function constructFakeCtx
 * @param {Chat} chat Целевой чат
 * @param {Context} ctx Текущий контекст
 * @returns {Context} Искусственный контекст
 */
const constructFakeCtx = (chat, ctx) => {
  const fakeCtx = Object.assign(
    Object.create(Object.getPrototypeOf(ctx)),
    ctx,
    { session: {}, state: {} },
  );
  Object.defineProperty(fakeCtx, 'chat', { value: chat });
  Object.defineProperty(fakeCtx, 'from', { value: { id: chat.id } });
  return fakeCtx;
};

/**
 * [Инициализация персистентной сессии]{@link initPersistentSession} для искусственного контекста и
 * отправка в искуственном контексте сообщений с применением обновлений
 * @function sendUpdates
 * @param {Context} ctx Контекст
 * @param {Context} fakeCtx Искусственный контекст для отправки обновлений в другой чат
 * @returns {Promise<void>}
 */
const sendUpdates = (ctx, fakeCtx) => initPersistentSession()(fakeCtx, async () => {
  const userMention = getMentionFromUseridOrUsername(
    ctx.state.autoUpdate.userid,
    emit(Events.Usernames.GetUsernameByUserid, ctx.state.autoUpdate.userid),
  );
  await manageListsMessages(
    fakeCtx,
    ctx.state.autoUpdate.userid,
    formMessages(fakeCtx, ctx.state.autoUpdate.userid),
    Format.join([ 'Актуальный список', userMention ], ' '),
    Format.join([ 'Неактуальный список', userMention ], ' '),
    { shouldSendNotification: false, isAutoUpdate: true },
  );
});

/**
 * 1. Выбор чатов, в которые нужно отправить обновления;
 * 2. Для каждого:
 * 2.1 [Создание искусственного контекста]{@link constructFakeCtx};
 * 2.2 [Отправка обновлений]{@link sendUpdates};
 * 2.3 Удаление из списка автоматического обновления при необходимости
 * @function selectChatsAndSendUpdates
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const selectChatsAndSendUpdates = async (ctx) => {
  const chats = await db.get(ctx.state.autoUpdate.userid).then(
    (chats) => chats.filter(({ id }) => id !== ctx.chat.id),
  );
  await Promise.all(chats.map((chat) => {

    const fakeCtx = constructFakeCtx(chat, ctx);

    return sendUpdates(ctx, fakeCtx).then(
      () => (fakeCtx.state.autoUpdate?.shouldRemoveChat ?
        removeChatFromAutoUpdate([ ctx.state.autoUpdate.userid ], chat.id) :
        Promise.resolve()),
    );
  }));
};

/**
 * Промежуточный обработчик, выполняющий автоматическое обновление списков желаний в других чатах
 * @function autoUpdateMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 * @returns {Promise<void>}
 * @async
 */
export const autoUpdateMiddleware = async (ctx, next) => {
  const memoized = Object.keys(ctx.session.persistent?.lists ?? {});

  await next();

  if (ctx.from.id === ctx.botInfo.id) {
    return;
  }

  const current = Object.keys(ctx.session.persistent?.lists ?? {});

  await checkChatsToAdd(ctx, new Set(memoized), current);
  await checkChatsToRemove(ctx, memoized, new Set(current));

  if (!ctx.state.autoUpdate?.userid || ctx.state.autoUpdate.userid === ctx.chat.id || !db) {
    return;
  }

  await selectChatsAndSendUpdates(ctx);
};
