import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('wishlist/cooperate module', () => {
  let emit;
  let sendList;
  let CooperateModule;

  beforeEach(async () => {
    /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
      Пробелы для консистентности с другими элементами массива
    */
    [ { emit }, sendList ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/store/event-bus').then((path) => replaceEsm(path)),
      replaceEsm('../helpers/send-list.js').then((module) => module.default),
    ]);
    CooperateModule = await import('../cooperate.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register cooperate action handler', () => {
    const bot = object([ 'action' ]);
    CooperateModule.configure(bot);
    verify(bot.action(/^cooperate (\d+) (\d+)$/, matchers.isA(Function)));
  });

  describe('cooperate action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'action' ]);
      ctx = { from: { id: 'fromId' }, match: [ null, '1', '2' ] };
      const captor = matchers.captor();
      CooperateModule.configure(bot);
      verify(bot.action(/^cooperate (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit cooperate event', () => {
      verify(emit(Events.Wishlist.CooperateOnItem, 1, 'fromId'));
    });

    it('should send list', () => {
      verify(sendList(ctx, 2));
    });
  });
});
