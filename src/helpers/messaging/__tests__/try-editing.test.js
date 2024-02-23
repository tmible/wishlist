import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import EditMessageErrorMessage from '@tmible/wishlist-bot/constants/edit-message-error-message';
import tryEditing from '../try-editing.js';

describe('tryEditing', () => {
  it('should call editing method', async (testContext) => {
    const editMessageText = testContext.mock.fn();
    await tryEditing({ telegram: { editMessageText } });
    assert(editMessageText.mock.calls.length > 0);
  });

  it('should catch not changed error', async (testContext) => {
    const editMessageText = testContext.mock.fn(
      () => Promise.reject(new Error(EditMessageErrorMessage)),
    );
    await assert.doesNotReject(() => tryEditing({ telegram: { editMessageText } }));
  });

  it('should throw other errors', async (testContext) => {
    const editMessageText = testContext.mock.fn(
      () => Promise.reject(new Error('other error')),
    );
    await assert.rejects(() => tryEditing({ telegram: { editMessageText } }));
  });
});
