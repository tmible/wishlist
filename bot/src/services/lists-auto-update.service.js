import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Format } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import formMessages from '@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';
import { persistentSession } from '@tmible/wishlist-bot/persistent-session';

/**
 * @typedef {import('telegraf').Telegram} Telegram
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').Chat} Chat
 * @typedef {import('telegraf').MiddlewareFn} MiddlewareFn
 * @typedef {import('classic-level').ClassicLevel} ClassicLevel
 * @typedef {import('@tmible/wishlist-common/event-bus').EventBus} EventBus
 */

/**
 * @module Сервис автоматического обновления списков желаний в чатах,
 * отличных от того в котором он был обновлён пользователем
 */

/**
 * Добавление чата в список автоматического обновления для списка желаний
 * @function addChatToAutoUpdate
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {{ id: number, type: string }} chat Добавляемый к автоматическому обновлению чат
 * @returns {Promise<void>}
 * @async
 */
const addChatToAutoUpdate = async (db, userid, chat) => {
  const current = await db.get(userid) ?? [];
  if (new Set(current.map(({ id }) => id)).has(chat.id)) {
    return;
  }
  await db.put(userid, [ ...current, chat ]);
};

/**
 * Удаление чата из списка автоматического обновления для списка желаний
 * @function removeChatFromAutoUpdate
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {number[]} userids Идентификаторы пользователей -- владельцев списков,
 *   которые были в удаляемом чате
 * @param {number} chatId Идентификатор удаляемого чата
 * @returns {Promise<void>}
 * @async
 */
const removeChatFromAutoUpdate = async (db, userids, chatId) => {
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
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {Context} ctx Контекст
 * @param {Set<number>} memoizedSet Множество идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в начале работы [промежуточного обработчика]{@link autoUpdate}
 * @param {number[]} current Массив идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в конце работы [промежуточного обработчика]{@link autoUpdate}
 * @returns {Promise<void>}
 * @async
 */
const checkChatsToAdd = async (db, ctx, memoizedSet, current) => {
  for (const userid of current) {
    if (memoizedSet.has(userid)) {
      continue;
    }
    delete ctx.state.autoUpdate?.userid;
    if (ctx.from.id === userid) {
      continue;
    }
    await addChatToAutoUpdate(db, userid, { id: ctx.chat.id, type: ctx.chat.type });
  }

  if (ctx.state.autoUpdate?.shouldAddChat) {
    await addChatToAutoUpdate(
      db,
      ctx.state.autoUpdate.shouldAddChat,
      { id: ctx.chat.id, type: ctx.chat.type },
    );
  }
};

/**
 * Проверка необходимости удаления и удаление чатов из списка автоматического обновления
 * @function checkChatsToRemove
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {Context} ctx Контекст
 * @param {number[]} memoized Массив идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в начале работы [промежуточного обработчика]{@link autoUpdate}
 * @param {Set<number>} currentSet Множество идентификаторов пользователей -- владельцев списков,
 *   списки которых были в чате в конце работы [промежуточного обработчика]{@link autoUpdate}
 * @returns {Promise<void>}
 * @async
 */
const checkChatsToRemove = async (db, ctx, memoized, currentSet) => {
  for (const userid of memoized) {
    if (currentSet.has(userid)) {
      continue;
    }
    await removeChatFromAutoUpdate(db, memoized, ctx.chat.id);
  }
};

/**
 * Создание искусственного контекста для отправки обновлений в другой чат
 * @function constructFakeCtx
 * @param {Chat} chat Целевой чат
 * @param {Telegram} telegram Объект -- обёртка над Bot API Телеграма
 * @returns {Context} Искусственный контекст
 */
const constructFakeCtx = (chat, telegram) => {
  const fakeCtx = { session: {}, state: {} };
  Object.defineProperty(fakeCtx, 'chat', { value: chat });
  Object.defineProperty(fakeCtx, 'from', { value: { id: chat.id } });
  Object.defineProperty(
    fakeCtx,
    'pinChatMessage',
    { value: (...args) => telegram.pinChatMessage(chat.id, ...args) },
  );
  Object.defineProperty(
    fakeCtx,
    'unpinChatMessage',
    { value: (...args) => telegram.unpinChatMessage(chat.id, ...args) },
  );
  Object.defineProperty(
    fakeCtx,
    'deleteMessage',
    { value: (...args) => telegram.deleteMessage(chat.id, ...args) },
  );
  Object.defineProperty(fakeCtx, 'telegram', { value: telegram });
  return fakeCtx;
};

/**
 * [Инициализация персистентной сессии]{@link persistentSession} для искусственного контекста и
 * отправка в искуственном контексте сообщений с применением обновлений
 * @function sendUpdates
 * @param {EventBus} eventBus Шина событий
 * @param {number} userid Идентификатор пользователя -- владельца обновлённого списка
 * @param {Context} fakeCtx Искусственный контекст для отправки обновлений в другой чат
 * @returns {Promise<void>}
 */
const sendUpdates = (eventBus, userid, fakeCtx) => persistentSession()(fakeCtx, async () => {
  const userMention = getMentionFromUseridOrUsername(
    userid,
    eventBus.emit(Events.Usernames.GetUsernameByUserid, userid),
  );
  await manageListsMessages(
    fakeCtx,
    userid,
    formMessages(eventBus, fakeCtx, userid),
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
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {unknown} logger Логгер
 * @returns {Promise<void>}
 * @async
 */
const selectChatsAndSendUpdates = async (db, eventBus, ctx, logger) => {
  const chats = await db.get(ctx.state.autoUpdate.userid).then(
    (chats) => chats.filter(({ id }) => id !== ctx.chat.id),
  );

  logger.info(
    {
      chatId: ctx.chat.id,
      userid: ctx.from.id,
      updateId: ctx.update.update_id,
    },
    `auto updating ${ctx.state.autoUpdate.userid} in ${chats.map(({ id }) => id).join(', ')}`,
  );

  await Promise.all(chats.map((chat) => {

    const fakeCtx = constructFakeCtx(chat, ctx.telegram);

    return sendUpdates(eventBus, ctx.state.autoUpdate.userid, fakeCtx).then(
      () => (fakeCtx.state.autoUpdate?.shouldRemoveChat ?
        removeChatFromAutoUpdate(db, [ ctx.state.autoUpdate.userid ], chat.id) :
        Promise.resolve()),
    );
  }));
};

/**
 * Автоматическое обновление списков во всех чатах, в которых есть список
 * указанного владельца при получении сообщения об обновлении через IPC хаб
 * @function autoUpdateFromIPCHub
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {EventBus} eventBus Шина событий
 * @param {Telegram} telegram Объект -- обёртка над Bot API Телеграма
 * @param {unknown} logger Логгер
 * @param {number} userid Идентификатор пользователя -- владельца обновлённого списка
 * @returns {Promise<void>}
 * @async
 */
export const autoUpdateFromIPCHub = async (db, eventBus, telegram, logger, userid) => {
  const chats = await db.get(userid);

  logger.info(`auto updating ${userid} in ${chats.map(({ id }) => id).join(', ')}`);

  await Promise.all(chats.map((chat) => {

    const fakeCtx = constructFakeCtx(chat, telegram);

    return sendUpdates(eventBus, userid, fakeCtx).then(
      () => (fakeCtx.state.autoUpdate?.shouldRemoveChat ?
        removeChatFromAutoUpdate(db, [ userid ], chat.id) :
        Promise.resolve()),
    );
  }));
};

/**
 * Получение объекта для доступа к БД и создание промежуточного обработчика,
 * выполняющего автоматическое обновление списков желаний в других чатах
 * Промежуточный обработчик запоминает, какие списки были в чате до обработки обновления, и после
 * неё, если обновление не от самого бота, проверяет, какие списки в чате и при различиях
 * (или явном указании необходимости) [добавляет]{@link checkChatsToAdd} чаты в список
 * автоматического обновления или [удаляет]{@link checkChatsToRemove} из него. Далее, если
 * необходимо автоматическое обновление не в текущем чате,
 * [отправляет обновления]{@link selectChatsAndSendUpdates} во все нужные чаты
 * @function autoUpdate
 * @returns {MiddlewareFn<Context>} Промежуточный обработчик, выполняющий автоматическое
 *   обновление списков желаний в других чатах
 */
export const autoUpdate = () => {
  const db = inject(InjectionToken.LocalDatabase)('auto-update');
  const eventBus = inject(InjectionToken.EventBus);
  const logger = inject(InjectionToken.Logger);

  return async (ctx, next) => {
    const memoized = Object.keys(ctx.session.persistent?.lists ?? {});

    await next();

    if (ctx.from.id === ctx.botInfo.id) {
      return;
    }

    const current = Object.keys(ctx.session.persistent?.lists ?? {});

    await checkChatsToAdd(db, ctx, new Set(memoized), current);
    await checkChatsToRemove(db, ctx, memoized, new Set(current));

    if (!ctx.state.autoUpdate?.userid || ctx.state.autoUpdate.userid === ctx.chat.id) {
      return;
    }

    await selectChatsAndSendUpdates(db, eventBus, ctx, logger);
  };
};
