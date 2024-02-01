import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('editing/initiate-update', () => {
  let sendMessageAndMarkItForMarkupRemove;
  let initiateUpdate;
  let ctx;

  beforeEach(async () => {
    ({ sendMessageAndMarkItForMarkupRemove } =
      await td.replaceEsm(await resolveModule('wishlist-bot/helpers/middlewares/remove-markup'))
    );
    initiateUpdate = (await import('../initiate-update.js')).default;
    ctx = { session: {}, match: [ null, 'match 1' ] };
    await initiateUpdate(ctx, 'message purpose', [ 'reply argument 1', 'reply argument 2' ]);
  });

  afterEach(() => td.reset());

  it('should save message purpose in session', () => {
    assert.deepEqual(ctx.session.messagePurpose, { type: 'message purpose', payload: 'match 1' });
  });

  it('should reply', () => {
    td.verify(
      sendMessageAndMarkItForMarkupRemove(ctx, 'reply', 'reply argument 1', 'reply argument 2'),
    );
  });
});
