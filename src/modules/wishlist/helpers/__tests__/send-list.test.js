import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import { Format } from 'telegraf';
import * as td from 'testdouble';
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('wishlist/send-list', () => {
  let formMessages;
  let getMentionFromUseridOrUsername;
  let manageListsMessages;
  let sendList;

  beforeEach(async () => {
    [
      formMessages,
      getMentionFromUseridOrUsername,
      manageListsMessages,
    ] = await Promise.all([
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages',
        ))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username',
        ))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages',
        ))).default
      )(),
    ]);
    sendList = (await import('../send-list.js')).default;
  });

  afterEach(() => td.reset());

  it('should send notification message if list is empty', async (testContext) => {
    td.when(formMessages(), { ignoreExtraArgs: true }).thenReturn([]);

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

  it('should send list if it is not empty', async () => {
    td.when(formMessages(), { ignoreExtraArgs: true }).thenReturn([ 'message 1', 'message 2' ]);
    td.when(
      getMentionFromUseridOrUsername(),
      { ignoreExtraArgs: true },
    ).thenDo(
      (_, username) => `@${username}`,
    );

    const ctx = {};

    await sendList(ctx, 'userid', 'username', { shouldSendNotification: true });

    td.verify(manageListsMessages(
      ctx,
      'userid',
      [ 'message 1', 'message 2' ],
      new Format.FmtString('Актуальный список @username'),
      new Format.FmtString('Неактуальный список @username'),
      {
        shouldForceNewMessages: false,
        shouldSendNotification: true,
        isManualUpdate: false,
      },
    ));
  });
});
