import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Format } from 'telegraf';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('lists auto update service', () => {
  let db;
  let getLocalDB;
  let initPersistentSession;
  let getMentionFromUseridOrUsername;
  let emit;
  let manageListsMessages;
  let formMessages;
  let startAutoUpdateService;
  let autoUpdateMiddleware;

  const sessionKey = 'sessionKey';

  beforeEach(async () => {
    [
      { getLocalDB },
      { initPersistentSession },
      getMentionFromUseridOrUsername,
      { emit },
      manageListsMessages,
      formMessages,
    ] = await Promise.all([
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/services/local-db')),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/persistent-session')),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username',
        ))).default
      )(),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages',
        ))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages',
        ))).default
      )(),
    ]);

    db = td.object([ 'get', 'getMany', 'put', 'batch' ]);
    td.when(getLocalDB('auto-update')).thenReturn(db);

    ({
      startAutoUpdateService,
      autoUpdateMiddleware,
    } = await import('../lists-auto-update.service.js'));
  });

  afterEach(() => td.reset());

  describe('startAutoUpdateService', () => {
    it('should get DB', () => {
      startAutoUpdateService();
      td.verify(getLocalDB('auto-update'));
    });
  });

  describe('autoUpdateMiddleware', () => {
    let ctx;
    let next;

    beforeEach(() => {
      ctx = {
        chat: { id: 'chatId' },
        from: { id: 'fromId' },
        botInfo: { id: 'botId' },
        session: {},
        state: {},
      };
      next = async () => {};
      startAutoUpdateService();
    });

    it('should cancel auto update if list was added to persistent session', async () => {
      ctx.state.autoUpdate = { userid: 'userid' };
      next = async () => ctx.session.persistent = { lists: { 'listId': {} } };
      td.when(db.get('listId')).thenReject();

      await autoUpdateMiddleware(ctx, next);

      assert.deepEqual(ctx.state.autoUpdate, {});
    });

    it('should not add chat to auto update if it is list owner\'s chat', async () => {
      next = async () => ctx.session.persistent = { lists: { 'fromId': {} } };
      await autoUpdateMiddleware(ctx, next);
      td.verify(db.put(), { ignoreExtraArgs: true, times: 0 });
    });

    it('should add chat to auto update if list was added to persistent session', async () => {
      ctx.chat.type = 'chatType';
      ctx.session.persistent = { lists: { 'listId 1': {} } };
      next = async () => ctx.session.persistent.lists['listId 2'] = {};
      td.when(db.get('listId 2')).thenReject();

      await autoUpdateMiddleware(ctx, next);

      td.verify(db.put('listId 2', [{ id: 'chatId', type: 'chatType' }]));
    });

    it('should not duplicate chats in auto update list', async () => {
      next = async () => ctx.session.persistent = { lists: { 'listId': {} } };
      td.when(db.get('listId')).thenResolve([{ id: 'chatId' }]);

      await autoUpdateMiddleware(ctx, next);

      td.verify(db.put(), { ignoreExtraArgs: true, times: 0 });
    });

    it('should add chat from state', async () => {
      ctx.chat.type = 'chatType';
      ctx.state.autoUpdate = { shouldAddChat: 'listId' };
      td.when(db.get('listId')).thenReject();

      await autoUpdateMiddleware(ctx, next);

      td.verify(db.put('listId', [{ id: 'chatId', type: 'chatType' }]));
    });

    it(
      'should remove chat from auto update if list was removed from persistent session',
      async () => {
        ctx.session.persistent = { lists: { 'listId 1': {}, 'listId 2': {} } };
        next = async () => ctx.session.persistent = { lists: { 'listId 2': {} } };
        td.when(
          db.getMany([ 'listId 1', 'listId 2' ]),
        ).thenResolve(
          [ [ { id: 'chatId' }, { id: 'anotherId' } ], undefined ],
        );

        await autoUpdateMiddleware(ctx, next);

        td.verify(db.batch([{
          type: 'put',
          key: 'listId 1',
          value: [{ id: 'anotherId' }],
        }, {
          type: 'put',
          key: 'listId 2',
          value: [],
        }]));
      },
    );

    it('should init persistent session for every fake context', async () => {
      ctx.state.autoUpdate = { userid: 'userid' };
      td.when(db.get('userid')).thenResolve(new Array(3).fill(null).map((_, i) => ({ id: i })));
      td.when(initPersistentSession()).thenReturn(async () => {});

      await autoUpdateMiddleware(ctx, next);

      td.verify(initPersistentSession(), { times: 3 });
    });

    it('should send updates to all chats except for current', async () => {
      ctx.state.autoUpdate = { userid: 'userid' };

      td.when(
        db.get('userid'),
      ).thenResolve(
        [ ...new Array(3).fill(null).map((_, i) => ({ id: i })), { id: 'chatId' } ],
      );

      const fakeCtxs = [];
      td.when(initPersistentSession()).thenReturn(async (ctx, next) => {
        fakeCtxs.push(ctx);
        await next();
      });

      td.when(
        emit(Events.Usernames.GetUsernameByUserid, ctx.state.autoUpdate.userid.toString()),
      ).thenReturn(
        'username',
      );

      td.when(
        getMentionFromUseridOrUsername(),
        { ignoreExtraArgs: true },
      ).thenDo(
        (_, username) => `@${username}`,
      );

      td.when(
        formMessages(td.matchers.anything(), 'userid'),
      ).thenDo(
        (fakeCtx) => new Array(2).fill(null).map((_, i) => `message ${fakeCtx.chat.id} ${i}`),
      );

      await autoUpdateMiddleware(ctx, next);

      fakeCtxs.forEach((fakeCtx) => {
        td.verify(manageListsMessages(
          fakeCtx,
          'userid',
          [ `message ${fakeCtx.chat.id} 0`, `message ${fakeCtx.chat.id} 1` ],
          new Format.FmtString('Актуальный список @username'),
          new Format.FmtString('Неактуальный список @username'),
          { shouldSendNotification: false, isAutoUpdate: true },
        ));
      });
    });

    it('should remove chat from auto update list after auto update if requested', async () => {
      ctx.state.autoUpdate = { userid: 'userid' };

      const chatIds = [{ id: 'chatId' }, { id: 'anotherId' }];

      td.when(db.get('userid')).thenResolve(chatIds);

      td.when(initPersistentSession()).thenReturn(async (ctx, next) => {
        ctx.state.autoUpdate = { shouldRemoveChat: true };
      });

      td.when(db.getMany([ 'userid' ])).thenResolve([ chatIds ]);

      await autoUpdateMiddleware(ctx, next);

      td.verify(db.batch([{
        type: 'put',
        key: 'userid',
        value: [{ id: 'chatId' }],
      }]));
    });
  });
});
