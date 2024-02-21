import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/initiate-update', () => {
  let sendMessageAndMarkItForMarkupRemove;
  let initiateUpdate;
  let ctx;

  beforeEach(async () => {
    ({ sendMessageAndMarkItForMarkupRemove } = await resolveModule(
      '@tmible/wishlist-bot/helpers/middlewares/remove-markup',
    ).then((path) => replaceEsm(path)));
    initiateUpdate = await import('../initiate-update.js').then((module) => module.default);
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
