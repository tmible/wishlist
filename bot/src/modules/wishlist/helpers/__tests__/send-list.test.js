import { afterEach, describe, it } from 'node:test';
import { Format } from 'telegraf';
import { reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [
  formMessages,
  getMentionFromUseridOrUsername,
  manageListsMessages,
] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages'),
]);
const sendList = await import('../send-list.js').then((module) => module.default);

describe('wishlist/send-list', () => {
  afterEach(reset);

  it('should send list if it is empty', async () => {
    when(formMessages(), { ignoreExtraArgs: true }).thenReturn([]);

    when(
      getMentionFromUseridOrUsername(),
      { ignoreExtraArgs: true },
    ).thenDo(
      (_, username) => `@${username}`,
    );

    const ctx = {};

    await sendList({}, ctx, 'userid', 'username');

    verify(manageListsMessages(
      ctx,
      'userid',
      [],
      new Format.FmtString('Список @username пуст'),
      new Format.FmtString('Неактуальный список @username'),
      {
        shouldForceNewMessages: false,
        shouldSendNotification: false,
        isManualUpdate: false,
      },
    ));
  });

  it('should send list if it is not empty', async () => {
    when(formMessages(), { ignoreExtraArgs: true }).thenReturn([ 'message 1', 'message 2' ]);
    when(
      getMentionFromUseridOrUsername(),
      { ignoreExtraArgs: true },
    ).thenDo(
      (_, username) => `@${username}`,
    );

    const ctx = {};

    await sendList({}, ctx, 'userid', 'username', { shouldSendNotification: true });

    verify(manageListsMessages(
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
