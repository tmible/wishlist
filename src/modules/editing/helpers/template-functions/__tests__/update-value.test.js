import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/update-value if there is message purpose in session', () => {
  let emit;
  let sendList;
  let updateValue;
  let ctx;

  beforeEach(async () => {
    [ { emit }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../../send-list.js')).default)(),
    ]);
    updateValue = (await import('../update-value.js')).default;
    ctx = td.object({
      update: { message: {} },
      reply: () => {},
      session: { messagePurpose: { type: 'message purpose', payload: 'itemId' } },
    });
  });

  afterEach(() => td.reset());

  it('should remove message purpose from session', async () => {
    await updateValue(ctx, 'message purpose', /^text$/, 'error', 'event', 'success');
    assert.deepEqual(ctx.session, {});
  });

  it('should reply if couldn\'t match message text and pattern', async () => {
    await updateValue(ctx, 'message purpose', /^text$/, 'error', 'event', 'success');
    td.verify(ctx.reply('error'));
  });

  describe('if message text matches pattern', () => {
    beforeEach(async () => {
      ctx.update.message.text = 'text';
      await updateValue(ctx, 'message purpose', /^text$/, 'error', 'event', 'success');
    });

    it('should emit event', () => {
      td.verify(emit('event', 'itemId', 'text'));
    });

    it('should reply', () => {
      td.verify(ctx.reply('success'));
    });

    it('should send list', () => {
      td.verify(sendList(ctx));
    });
  });
});
