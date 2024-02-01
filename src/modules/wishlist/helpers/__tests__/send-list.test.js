import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import { Format } from 'telegraf';
import * as td from 'testdouble';
import ListItemState from 'wishlist-bot/constants/list-item-state';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('wishlist/send-list', () => {
  let emit;
  let getMentionFromUseridOrUsername;
  let isChatGroup;
  let manageListsMessages;
  let sendList;

  beforeEach(async () => {
    [
      { emit },
      getMentionFromUseridOrUsername,
      isChatGroup,
      manageListsMessages,
    ] = await Promise.all([
      td.replaceEsm(await resolveModule('wishlist-bot/store/event-bus')),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          'wishlist-bot/helpers/messaging/get-mention-from-userid-or-username',
        ))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule('wishlist-bot/helpers/is-chat-group'))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          'wishlist-bot/helpers/messaging/manage-lists-messages',
        ))).default
      )(),
    ]);
    sendList = (await import('../send-list.js')).default;
  });

  afterEach(() => td.reset());

  it('should send notification message if list is empty', async (testContext) => {
    td.when(emit(), { ignoreExtraArgs: true }).thenReturn([]);

    td.when(
      getMentionFromUseridOrUsername(),
      { ignoreExtraArgs: true },
    ).thenReturn(
      new Format.FmtString('@username', [{ type: 'mention', offset: 0, length: 9 }]),
    );

    const ctx = { sendMessage: testContext.mock.fn(async () => {}) };

    await sendList(ctx, 'userid', 'username');

    assert.deepEqual(
      ctx.sendMessage.mock.calls[0].arguments,
      [ new Format.FmtString(
        'Список @username пуст',
        [{ type: 'mention', offset: 7, length: 9 }],
      ) ],
    );
  });

  describe('if list is not empty', () => {
    const list = [{
      id: 1,
      priority: 1,
      name: 'name 1',
      description: 'description 1',
      descriptionEntities: [],
      state: ListItemState.FREE,
      participants: [],
      participantsIds: [],
    }, {
      id: 2,
      priority: 1,
      name: 'name 2',
      description: 'description 2',
      descriptionEntities: [],
      state: ListItemState.COOPERATIVE,
      participants: [ 'from' ],
      participantsIds: [ 'fromId' ],
    }, {
      id: 3,
      priority: 3,
      name: 'name 3',
      description: 'description 3',
      descriptionEntities: [{ offset: 0, length: 0, type: 'type' }],
      state: ListItemState.COOPERATIVE,
      participants: [ 'anotherUser' ],
      participantsIds: [ 'anotherUserId' ],
    }, {
      id: 4,
      priority: 1,
      name: 'name 4',
      description: 'description 4',
      descriptionEntities: [],
      state: ListItemState.BOOKED,
      participants: [ 'from' ],
      participantsIds: [ 'fromId' ],
    }, {
      id: 5,
      priority: 3,
      name: 'name 5',
      description: 'description 5',
      descriptionEntities: [],
      state: ListItemState.BOOKED,
      participants: [ 'anotherUser' ],
      participantsIds: [ 'anotherUserId' ],
    }];

    it('should send it in private chat', async () => {
      td.when(emit(), { ignoreExtraArgs: true }).thenReturn(list);
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      td.when(
        getMentionFromUseridOrUsername(),
        { ignoreExtraArgs: true },
      ).thenDo(
        (_, username) => `@${username}`,
      );

      const ctx = { from: { id: 'fromId' } };
      const captors = new Array(5).fill(null).map(() => td.matchers.captor());

      await sendList(ctx, 'userid', 'username');

      td.verify(
        manageListsMessages(...captors.map(({ capture }) => capture())),
        { ignoreExtraArgs: true },
      );
      await assertSnapshot(
        JSON.stringify(captors.map(({ value }) => value)),
        resolve(import.meta.dirname, './__snapshots__/send-list-private.json'),
      );
    });

    it('should send it in group chat', async () => {
      td.when(emit(), { ignoreExtraArgs: true }).thenReturn(list);
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(true);
      td.when(
        getMentionFromUseridOrUsername(),
        { ignoreExtraArgs: true },
      ).thenDo(
        (_, username) => `@${username}`,
      );

      const ctx = { from: { id: 'fromId' } };
      const captors = new Array(5).fill(null).map(() => td.matchers.captor());

      await sendList(ctx, 'userid', 'username');

      td.verify(
        manageListsMessages(...captors.map(({ capture }) => capture())),
        { ignoreExtraArgs: true },
      );
      await assertSnapshot(
        JSON.stringify(captors.map(({ value }) => value)),
        resolve(import.meta.dirname, './__snapshots__/send-list-group.json'),
      );
    });
  });
});
