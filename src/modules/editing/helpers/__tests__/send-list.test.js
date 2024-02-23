import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import { matchers, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [ isChatGroup, manageListsMessages ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages'),
]);
const sendList = await import('../send-list.js').then((module) => module.default);

describe('editing/send-list if chat isn\'t group', () => {
  let ctx;

  beforeEach(() => {
    ctx = { chat: { id: 'userid' } };
    when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
  });

  afterEach(reset);

  it('should send notification message if list is empty', async (testContext) => {
    ctx.reply = testContext.mock.fn();
    await sendList({ emit: () => [] }, ctx);
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
    const captors = new Array(5).fill(null).map(() => matchers.captor());
    await sendList({ emit: () => list }, ctx);
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
