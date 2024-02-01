import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import PinMessageErrorMessage from 'wishlist-bot/constants/pin-message-error-message';
import tryPinning from '../try-pinning.js';

describe('tryPinning', () => {
  it('should call editing method', async (testContext) => {
    const pinChatMessage = testContext.mock.fn(async () => {});
    await tryPinning({ pinChatMessage }, 'pinChatMessage');
    assert(pinChatMessage.mock.calls.length > 0);
  });

  it('should catch not changed error', async (testContext) => {
    const pinChatMessage = testContext.mock.fn(
      () => new Promise((_, reject) => reject(new Error(PinMessageErrorMessage))),
    );
    await assert.doesNotReject(() => tryPinning({ pinChatMessage }, 'pinChatMessage'));
  });

  it('should throw other errors', async (testContext) => {
    const pinChatMessage = testContext.mock.fn(
      () => new Promise((_, reject) => reject(new Error('other error'))),
    );
    await assert.rejects(() => tryPinning({ pinChatMessage }, 'pinChatMessage'));
  });
});
