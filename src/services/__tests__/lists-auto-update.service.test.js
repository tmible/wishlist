import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Format } from 'telegraf';
import { matchers, object, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import Events from '@tmible/wishlist-bot/store/events';

const [
  { getLocalDB },
  { initPersistentSession },
  getMentionFromUseridOrUsername,
  { emit },
  manageListsMessages,
  formMessages,
] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/services/local-db'),
  replaceModule('@tmible/wishlist-bot/persistent-session'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username'),
  replaceModule('@tmible/wishlist-bot/store/event-bus'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages'),
]);

const {
  startAutoUpdateService,
  autoUpdateMiddleware,
} = await import('../lists-auto-update.service.js');

describe('lists auto update service', () => {
  let db;

  beforeEach(() => {
    db = object([ 'get', 'getMany', 'put', 'batch' ]);
    when(getLocalDB('auto-update')).thenReturn(db);
  });

  afterEach(reset);

  describe('startAutoUpdateService', () => {
    it('should get DB', () => {
      startAutoUpdateService();
      verify(getLocalDB('auto-update'));
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
      next = () => {};
      startAutoUpdateService();
    });

    it('should cancel auto update if list was added to persistent session', async () => {
      ctx.state.autoUpdate = { userid: 'userid' };
      next = () => ctx.session.persistent = { lists: { listId: {} } };
      when(db.get('listId')).thenReject({ code: 'LEVEL_NOT_FOUND' });

      await autoUpdateMiddleware(ctx, next);

      assert.deepEqual(ctx.state.autoUpdate, {});
    });

    it('should not add chat to auto update if it is list owner\'s chat', async () => {
      next = () => ctx.session.persistent = { lists: { fromId: {} } };
      await autoUpdateMiddleware(ctx, next);
      verify(db.put(), { ignoreExtraArgs: true, times: 0 });
    });

    it('should add chat to auto update if list was added to persistent session', async () => {
      ctx.chat.type = 'chatType';
      ctx.session.persistent = { lists: { 'listId 1': {} } };
      next = () => ctx.session.persistent.lists['listId 2'] = {};
      when(db.get('listId 2')).thenReject({ code: 'LEVEL_NOT_FOUND' });

      await autoUpdateMiddleware(ctx, next);

      verify(db.put('listId 2', [{ id: 'chatId', type: 'chatType' }]));
    });

    it('should not duplicate chats in auto update list', async () => {
      next = () => ctx.session.persistent = { lists: { listId: {} } };
      when(db.get('listId')).thenResolve([{ id: 'chatId' }]);

      await autoUpdateMiddleware(ctx, next);

      verify(db.put(), { ignoreExtraArgs: true, times: 0 });
    });

    it('should add chat from state', async () => {
      ctx.chat.type = 'chatType';
      ctx.state.autoUpdate = { shouldAddChat: 'listId' };
      when(db.get('listId')).thenReject({ code: 'LEVEL_NOT_FOUND' });

      await autoUpdateMiddleware(ctx, next);

      verify(db.put('listId', [{ id: 'chatId', type: 'chatType' }]));
    });

    it(
      'should remove chat from auto update if list was removed from persistent session',
      async () => {
        ctx.session.persistent = { lists: { 'listId 1': {}, 'listId 2': {} } };
        next = () => ctx.session.persistent = { lists: { 'listId 2': {} } };
        when(
          db.getMany([ 'listId 1', 'listId 2' ]),
        ).thenResolve(
          /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
            Пробелы для консистентности с другими элементами массива
          */
          [ [{ id: 'chatId' }, { id: 'anotherId' }], undefined ],
        );

        await autoUpdateMiddleware(ctx, next);

        verify(db.batch([{
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
      when(db.get('userid')).thenResolve(new Array(3).fill(null).map((_, i) => ({ id: i })));
      when(initPersistentSession()).thenReturn(() => Promise.resolve());

      await autoUpdateMiddleware(ctx, next);

      verify(initPersistentSession(), { times: 3 });
    });

    it('should send updates to all chats except for current', async () => {
      ctx.state.autoUpdate = { userid: 'userid' };

      when(
        db.get('userid'),
      ).thenResolve(
        /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
          Пробелы для консистентности с другими элементами массива
        */
        [ ...new Array(3).fill(null).map((_, i) => ({ id: i })), { id: 'chatId' } ],
      );

      const fakeCtxs = [];
      when(initPersistentSession()).thenReturn(async (ctx, next) => {
        fakeCtxs.push(ctx);
        await next();
      });

      when(
        emit(Events.Usernames.GetUsernameByUserid, ctx.state.autoUpdate.userid.toString()),
      ).thenReturn(
        'username',
      );

      when(
        getMentionFromUseridOrUsername(),
        { ignoreExtraArgs: true },
      ).thenDo(
        (_, username) => `@${username}`,
      );

      when(
        formMessages(matchers.anything(), 'userid'),
      ).thenDo(
        (fakeCtx) => new Array(2).fill(null).map((_, i) => `message ${fakeCtx.chat.id} ${i}`),
      );

      await autoUpdateMiddleware(ctx, next);

      fakeCtxs.forEach((fakeCtx) => {
        verify(manageListsMessages(
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

      when(db.get('userid')).thenResolve(chatIds);

      when(initPersistentSession()).thenReturn((ctx) => {
        ctx.state.autoUpdate = { shouldRemoveChat: true };
        return Promise.resolve();
      });

      when(db.getMany([ 'userid' ])).thenResolve([ chatIds ]);

      await autoUpdateMiddleware(ctx, next);

      verify(db.batch([{
        type: 'put',
        key: 'userid',
        value: [{ id: 'chatId' }],
      }]));
    });
  });
});
