import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const { sendMessageAndMarkItForMarkupRemove } = await replaceModule(
  '@tmible/wishlist-bot/helpers/middlewares/remove-markup',
  false,
);
const initiateUpdate = await import('../initiate-update.js').then((module) => module.default);

describe('editing/initiate-update', () => {
  let ctx;

  beforeEach(async () => {
    ctx = { session: {}, match: [ null, 'match 1' ] };
    await initiateUpdate(ctx, 'message purpose', [ 'reply argument 1', 'reply argument 2' ]);
  });

  afterEach(reset);

  it('should save message purpose in session', () => {
    assert.deepEqual(ctx.session.messagePurpose, { type: 'message purpose', payload: 'match 1' });
  });

  it('should reply', () => {
    verify(
      sendMessageAndMarkItForMarkupRemove(ctx, 'reply', 'reply argument 1', 'reply argument 2'),
    );
  });
});
