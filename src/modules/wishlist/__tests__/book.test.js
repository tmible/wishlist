import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('wishlist/book module', () => {
  let emit;
  let sendList;
  let BookModule;

  beforeEach(async () => {
    /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
      Пробелы для консистентности с другими элементами массива
    */
    [ { emit }, sendList ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/store/event-bus').then((path) => replaceEsm(path)),
      replaceEsm('../helpers/send-list.js').then((module) => module.default),
    ]);
    BookModule = await import('../book.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register book action handler', () => {
    const bot = object([ 'action' ]);
    BookModule.configure(bot);
    verify(bot.action(/^book (\d+) (\d+)$/, matchers.isA(Function)));
  });

  describe('book action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'action' ]);
      ctx = { from: { id: 'fromId' }, match: [ null, '1', '2' ] };
      const captor = matchers.captor();
      BookModule.configure(bot);
      verify(bot.action(/^book (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit book event', () => {
      verify(emit(Events.Wishlist.BookItem, 1, 'fromId'));
    });

    it('should send list', () => {
      verify(sendList(ctx, 2));
    });
  });
});
