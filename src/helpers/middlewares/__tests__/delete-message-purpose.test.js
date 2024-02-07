import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import deleteMessagePurposeMiddleware from '../delete-message-purpose.js';

describe('deleteMessagePurposeMiddleware', () => {
  let ctx;
  let next;

  beforeEach(() => {
    ctx = { session: { messagePurpose: 'messagePurpose' } };
    next = mock.fn(async () => {});
  });

  afterEach(() => mock.reset());

  it('should pass', async () => {
    await deleteMessagePurposeMiddleware(ctx, next);
    assert.equal(next.mock.calls.length, 1);
  });

  it('should delete message purpose from session', async () => {
    await deleteMessagePurposeMiddleware(ctx, next);
    assert.deepEqual(ctx.session, {});
  });

  it('should delete message purpose from session if next throws error', async (testContext) => {
    next = testContext.mock.fn(async () => Promise.reject());
    try {
      await deleteMessagePurposeMiddleware(ctx, next);
    } catch {
      assert.deepEqual(ctx.session, {});
    }
  });
});
