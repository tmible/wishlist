import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('manageListsMessages', () => {
  let manageListsMessages;
  const mocks = {};

  const testSuits = [{
    name: 'if there are less or equal new messages than old messages',
    shouldForceNewMessages: false,
    sessionInitializer: () => ({
      userid: {
        pinnedMessageId: 'pinnedMessageId',
        messagesToEditIds: [ 1, 2 ],
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
        messagesToEditIds: [],
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
        messagesToEditIds: [],
      },
    }),
    positiveTestCaseName: 'should resend messages',
    targetMock: 'resendListsMessages',
    negativeTestCaseName: 'should not update messages',
    avoidedMock: 'updateListsMessages',
  }];

  beforeEach(async () => {
    [ mocks.resendListsMessages, mocks.updateListsMessages ] = await Promise.all([
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/resend-lists-messages',
        ))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/messaging/update-lists-messages',
        ))).default
      )(),
    ]);
    manageListsMessages = (await import('../manage-lists-messages.js')).default;
  });

  afterEach(() => td.reset());

  for (const suit of testSuits) {
    describe(suit.name, () => {
      beforeEach(async () => {
        await manageListsMessages(
          { session: { persistent: { lists: suit.sessionInitializer() } } },
          'userid',
          [[ 'message 1' ]],
          'titleMessageText',
          'outdatedTitleMessageText',
          suit.shouldForceNewMessages,
        );
      });

      it(suit.positiveTestCaseName, () => {
        td.verify(mocks[suit.targetMock](), { ignoreExtraArgs: true, times: 1 });
      });

      it(suit.negativeTestCaseName, () => {
        td.verify(mocks[suit.avoidedMock](), { ignoreExtraArgs: true, times: 0 });
      });
    });
  }
});
