import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import Events from '@tmible/wishlist-bot/store/events';

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
      Пробелы для консистентности с другими элементами массива
    */
const [ { emit }, sendList ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/store/event-bus'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);
const RetireModule = await import('../retire.js').then((module) => module.default);

describe('wishlist/retire module', () => {
  afterEach(reset);

  it('should register retire action handler', () => {
    const bot = object([ 'action' ]);
    RetireModule.configure(bot);
    verify(bot.action(/^retire (\d+) (\d+)$/, matchers.isA(Function)));
  });

  describe('retire action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'action' ]);
      ctx = { from: { id: 'fromId' }, match: [ null, '1', '2' ] };
      const captor = matchers.captor();
      RetireModule.configure(bot);
      verify(bot.action(/^retire (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit retire event', () => {
      verify(emit(Events.Wishlist.RetireFromItem, 1, 'fromId'));
    });

    it('should send list', () => {
      verify(sendList(ctx, 2));
    });
  });
});
