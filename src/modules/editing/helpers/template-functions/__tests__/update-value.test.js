import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { object, replaceEsm, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
    Пробелы для консистентности с другими элементами массива
  */
const [ { emit }, sendList ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/store/event-bus'),
  replaceEsm('../../send-list.js').then((module) => module.default),
]);
const updateValue = await import('../update-value.js').then((module) => module.default);

describe('editing/update-value if there is message purpose in session', () => {
  let ctx;

  beforeEach(() => {
    ctx = object({
      update: { message: {} },
      reply: () => {},
      session: { messagePurpose: { type: 'message purpose', payload: 'itemId' } },
    });
  });

  afterEach(reset);

  it('should remove message purpose from session', async () => {
    await updateValue(ctx, 'message purpose', /^text$/, 'error', 'event', 'success');
    assert.deepEqual(ctx.session, {});
  });

  it('should reply if couldn\'t match message text and pattern', async () => {
    await updateValue(ctx, 'message purpose', /^text$/, 'error', 'event', 'success');
    verify(ctx.reply('error'));
  });

  describe('if message text matches pattern', () => {
    beforeEach(async () => {
      ctx.update.message.text = 'text';
      await updateValue(ctx, 'message purpose', /^text$/, 'error', 'event', 'success');
    });

    it('should emit event', () => {
      verify(emit('event', 'itemId', 'text'));
    });

    it('should reply', () => {
      verify(ctx.reply('success'));
    });

    it('should send list', () => {
      verify(sendList(ctx));
    });
  });
});
