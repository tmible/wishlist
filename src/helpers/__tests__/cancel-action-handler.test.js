import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import cancelActionHandler from '../cancel-action-handler.js';

describe('cancelActionHandler', () => {
  let ctx;
  let reply;
  let deleteMessage;

  beforeEach(() => {
    reply = mock.fn(async () => {});
    deleteMessage = mock.fn(async () => {});
    ctx = { reply, deleteMessage, session: {} };
  });

  afterEach(() => mock.reset());

  describe('if message deletion is required', () => {
    it('should delete message', async () => {
      await cancelActionHandler(ctx);
      assert.equal(deleteMessage.mock.calls.length, 1);
    });

    it('should not reply', async () => {
      await cancelActionHandler(ctx);
      assert.equal(reply.mock.calls.length, 0);
    });
  });

  describe('if message deletion is not required', () => {
    it('should not delete message', async () => {
      await cancelActionHandler(ctx, 'reply', false);
      assert.equal(deleteMessage.mock.calls.length, 0);
    });

    it('should reply', async () => {
      await cancelActionHandler(ctx, 'reply', false);
      assert.deepEqual(reply.mock.calls[0].arguments, [ 'reply' ]);
    });
  });

  it('should delete message purpose from session', async () => {
    ctx.session.messagePurpose = {};
    await cancelActionHandler(ctx);
    assert.equal(ctx.session.messagePurpose, undefined);
  });
});
