import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('manageListsMessages', () => {
  let manageListsMessages;
  let ctx;

  const mocks = {};

  const testSuits = [{
    name: 'if there are less or equal new messages than old messages',
    shouldForceNewMessages: false,
    sessionInitializer: () => ({
      userid: {
        pinnedMessageId: 'pinnedMessageId',
        messagesToEdit: [ 1, 2 ],
      },
    }),
    positiveTestCaseName: 'should update messages',
    targetMock: 'updateListsMessages',
    negativeTestCaseName: 'should not resend messages',
    avoidedMock: 'resendListsMessages',
  }, {
    name: 'if shouldForceNewMessages is true',
    shouldForceNewMessages: true,
    sessionInitializer: () => ({
      userid: {
        pinnedMessageId: 'pinnedMessageId',
        messagesToEdit: [],
      },
    }),
    positiveTestCaseName: 'should resend messages',
    targetMock: 'resendListsMessages',
    negativeTestCaseName: 'should not update messages',
    avoidedMock: 'updateListsMessages',
  }, {
    name: 'if there are no old messages',
    shouldForceNewMessages: false,
    sessionInitializer: () => ({}),
    positiveTestCaseName: 'should resend messages',
    targetMock: 'resendListsMessages',
    negativeTestCaseName: 'should not update messages',
    avoidedMock: 'updateListsMessages',
  }, {
    name: 'if there are more new messages than old messages',
    shouldForceNewMessages: false,
    sessionInitializer: () => ({
      userid: {
        pinnedMessageId: 'pinnedMessageId',
        messagesToEdit: [],
      },
    }),
    positiveTestCaseName: 'should resend messages',
    targetMock: 'resendListsMessages',
    negativeTestCaseName: 'should not update messages',
    avoidedMock: 'updateListsMessages',
  }];

  beforeEach(async () => {
    [ mocks.resendListsMessages, mocks.updateListsMessages ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/helpers/messaging/resend-lists-messages')
        .then((path) => replaceEsm(path))
        .then((module) => module.default),
      resolveModule('@tmible/wishlist-bot/helpers/messaging/update-lists-messages')
        .then((path) => replaceEsm(path))
        .then((module) => module.default),
    ]);
    manageListsMessages = await import('../manage-lists-messages.js')
      .then((module) => module.default);
  });

  afterEach(reset);

  for (const suit of testSuits) {
    describe(suit.name, () => {
      beforeEach(async () => {
        await manageListsMessages(
          { session: { persistent: { lists: suit.sessionInitializer() } }, state: {} },
          'userid',
          [[ 'message 1' ]],
          'titleMessageText',
          'outdatedTitleMessageText',
          { shouldForceNewMessages: suit.shouldForceNewMessages },
        );
      });

      it(suit.positiveTestCaseName, () => {
        verify(mocks[suit.targetMock](), { ignoreExtraArgs: true, times: 1 });
      });

      it(suit.negativeTestCaseName, () => {
        verify(mocks[suit.avoidedMock](), { ignoreExtraArgs: true, times: 0 });
      });
    });
  }

  it('should mark list for auto update', async () => {
    ctx = { session: { persistent: { lists: {} } }, state: {} };
    await manageListsMessages(
      ctx,
      'userid',
      [[ 'message 1' ]],
      'titleMessageText',
      'outdatedTitleMessageText',
    );
    assert.deepEqual(ctx.state, { autoUpdate: { userid: 'userid' } });
  });

  it('should add chat to auto update', async () => {
    ctx = { session: { persistent: { lists: {} } }, state: {} };
    await manageListsMessages(
      ctx,
      'userid',
      [[ 'message 1' ]],
      'titleMessageText',
      'outdatedTitleMessageText',
      { isManualUpdate: true },
    );
    assert.deepEqual(ctx.state, { autoUpdate: { shouldAddChat: 'userid' } });
  });

  it('should remove chat from auto update', async () => {
    ctx = { session: { persistent: { lists: {} } }, state: {} };
    await manageListsMessages(
      ctx,
      'userid',
      [[ 'message 1' ]],
      'titleMessageText',
      'outdatedTitleMessageText',
      { shouldForceNewMessages: true, isAutoUpdate: true },
    );
    assert.deepEqual(ctx.state, { autoUpdate: { shouldRemoveChat: true } });
  });
});
