import { Format } from 'telegraf';
import formMessages from '@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';
import { initPersistentSession } from '@tmible/wishlist-bot/persistent-session';
import { getLocalDB } from '@tmible/wishlist-bot/services/local-db';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';

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
 */
export const startAutoUpdateService = () => db = getLocalDB('auto-update');

/**
 * Добавление чата в список автоматического обновления для списка желаний
 * @async
 * @function addChatToAutoUpdate
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {{ id: number, type: string }} chat Добавляемый к автоматическому обновлению чат
 */
const addChatToAutoUpdate = async (userid, chat) => {
  let current = [];
  try {
    current = await db.get(userid);
  } catch {}
  if (new Set(current.map(({ id }) => id)).has(chat.id)) {
    return;
  }
  await db.put(userid, [ ...current, chat ]);
};

/**
 * Удаление чата из списка автоматического обновления для списка желаний
 * @async
 * @function removeChatFromAutoUpdate
 * @param {number[]} userids Идентификаторы пользователей -- владельцев списков, которые были в удаляемом чате
 * @param {number} chatId Идентификатор удаляемого чата
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
 * @async
 * @function checkChatsToAdd
 * @param {Context} ctx Контекст
 * @param {Set<number>} memoizedSet Множество идентификаторов пользователей -- владельцев списков,
 * списки которых были в чате в начале работы [промежуточного обработчика]{@link autoUpdateMiddleware}
 * @param {number[]} current Массив идентификаторов пользователей -- владельцев списков,
 * списки которых были в чате в конце работы [промежуточного обработчика]{@link autoUpdateMiddleware}
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
 * @async
 * @function checkChatsToRemove
 * @param {Context} ctx Контекст
 * @param {number[]} memoized Массив идентификаторов пользователей -- владельцев списков,
 * списки которых были в чате в начале работы [промежуточного обработчика]{@link autoUpdateMiddleware}
 * @param {Set<number>} currentSet Множество идентификаторов пользователей -- владельцев списков,
 * списки которых были в чате в конце работы [промежуточного обработчика]{@link autoUpdateMiddleware}
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
 * [Инициализация персистентной сессии]{@link initPersistentSession} для искусственного контекста и
 * отправка в искуственном контексте сообщений с применением обновлений
 * @function sendUpdates
 * @param {Context} ctx Контекст
 * @param {Context} fakeCtx Искусственный контекст для отправки обновлений в другой чат
 * @returns {Promise<void>}
 */
const sendUpdates = (ctx, fakeCtx) => {
  return initPersistentSession()(fakeCtx, async () => {
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
  })
};

/**
 * Промежуточный обработчик, выполняющий автоматическое обновление списков желаний в других чатах
 * @async
 * @function autoUpdateMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
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

  if (!ctx.state.autoUpdate?.userid || !db) {
    return;
  }

  const chats = (await db.get(ctx.state.autoUpdate.userid)).filter(({ id }) => id !== ctx.chat.id);
  await Promise.all(chats.map((chat, i) => {

    const fakeCtx = Object.assign(
      Object.create(Object.getPrototypeOf(ctx)),
      ctx,
      { session: {}, state: {} },
    );
    Object.defineProperty(fakeCtx, 'chat', { value: chat });
    Object.defineProperty(fakeCtx, 'from', { value: { id: chat.id } });

    return sendUpdates(ctx, fakeCtx).then(async () => {
      if (fakeCtx.state.autoUpdate?.shouldRemoveChat) {
        await removeChatFromAutoUpdate(
          [ ctx.state.autoUpdate.userid ],
          chat.id,
        );
      }
    });
  }));
};
