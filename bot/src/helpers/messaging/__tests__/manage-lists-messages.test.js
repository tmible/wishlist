import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

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

const mocks = {};
[ mocks.resendListsMessages, mocks.updateListsMessages ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/messaging/resend-lists-messages'),
  replaceModule('@tmible/wishlist-bot/helpers/messaging/update-lists-messages'),
]);
const manageListsMessages = await import('../manage-lists-messages.js')
  .then((module) => module.default);

describe('manageListsMessages', () => {
  let ctx;

  beforeEach(() => {
    ctx = { session: { persistent: { lists: {} } }, state: {} };
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
