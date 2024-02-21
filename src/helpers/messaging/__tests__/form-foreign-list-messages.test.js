import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import { replaceEsm, reset, when } from 'testdouble';
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('form foreign list messages', () => {
  let emit;
  let getMentionFromUseridOrUsername;
  let isChatGroup;
  let formMessages;
  let ctx;

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
    description: '',
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

  beforeEach(async () => {
    [
      { emit },
      getMentionFromUseridOrUsername,
      isChatGroup,
    ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/store/event-bus').then((path) => replaceEsm(path)),
      resolveModule('@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username')
        .then((path) => replaceEsm(path))
        .then((module) => module.default),
      resolveModule('@tmible/wishlist-bot/helpers/is-chat-group')
        .then((path) => replaceEsm(path))
        .then((module) => module.default),
    ]);

    formMessages = await import('../form-foreign-list-messages.js')
      .then((module) => module.default);

    when(emit(), { ignoreExtraArgs: true }).thenReturn(list);
    when(
      getMentionFromUseridOrUsername(),
      { ignoreExtraArgs: true },
    ).thenDo(
      (_, username) => `@${username}`,
    );

    ctx = { from: { id: 'fromId' } };
  });

  afterEach(reset);

  it('should form in private chat', async () => {
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);

    const messages = formMessages(ctx, 'userid');

    await assertSnapshot(
      JSON.stringify(messages),
      resolve(import.meta.dirname, './__snapshots__/form-foreign-list-messages-private.json'),
    );
  });

  it('should form in group chat', async () => {
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(true);

    const messages = formMessages(ctx, 'userid');

    await assertSnapshot(
      JSON.stringify(messages),
      resolve(import.meta.dirname, './__snapshots__/form-foreign-list-messages-group.json'),
    );
  });
});
