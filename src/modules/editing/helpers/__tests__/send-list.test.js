import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import { matchers, replaceEsm, reset, verify, when } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/send-list if chat isn\'t group', () => {
  let emit;
  let isChatGroup;
  let manageListsMessages;
  let sendList;
  let ctx;

  beforeEach(async () => {
    [
      { emit },
      isChatGroup,
      manageListsMessages,
    ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/store/event-bus').then((path) => replaceEsm(path)),
      resolveModule('@tmible/wishlist-bot/helpers/is-chat-group')
        .then((path) => replaceEsm(path))
        .then((module) => module.default),
      resolveModule('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages')
        .then((path) => replaceEsm(path))
        .then((module) => module.default),
    ]);
    sendList = await import('../send-list.js').then((module) => module.default);
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
    ctx = { chat: { id: 'userid' } };
  });

  afterEach(reset);

  it('should send notification message if list is empty', async (testContext) => {
    when(emit(), { ignoreExtraArgs: true }).thenReturn([]);

    ctx.reply = testContext.mock.fn(async () => {});

    await sendList(ctx);

    assert.deepEqual(
      ctx.reply.mock.calls[0].arguments,
      [ 'Ваш список пуст. Вы можете добавить в него что-нибудь с помощью команды /add' ],
    );
  });

  const list = [{
    id: 1,
    priority: 1,
    name: 'name 1',
    description: '',
    descriptionEntities: [],
  }, {
    id: 2,
    priority: 1,
    name: 'name 2',
    description: 'description 2',
    descriptionEntities: [{ offset: 0, length: 0, type: 'type' }],
  }];

  it('should send list if it is not empty', async () => {
    when(emit(), { ignoreExtraArgs: true }).thenReturn(list);
    const captors = new Array(5).fill(null).map(() => matchers.captor());

    await sendList(ctx);

    verify(
      manageListsMessages(...captors.map(({ capture }) => capture())),
      { ignoreExtraArgs: true },
    );
    await assertSnapshot(
      JSON.stringify(captors.map(({ value }) => value)),
      resolve(import.meta.dirname, './__snapshots__/send-list.json'),
    );
  });
});
