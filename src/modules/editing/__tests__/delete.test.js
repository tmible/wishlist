import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/delete module', () => {
  let emit;
  let sendList;
  let DeleteModule;

  beforeEach(async () => {
    /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
      Пробелы для консистентности с другими элементами массива
    */
    [ { emit }, sendList ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/store/event-bus').then((path) => replaceEsm(path)),
      replaceEsm('../helpers/send-list.js').then((module) => module.default),
    ]);
    DeleteModule = await import('../delete.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register delete action handler', () => {
    const bot = object([ 'action' ]);
    DeleteModule.configure(bot);
    verify(bot.action(/^delete (\d+)$/, matchers.isA(Function)));
  });

  describe('delete action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = object([ 'action' ]);
      ctx = { match: [ null, 'match 1' ] };
      const captor = matchers.captor();
      DeleteModule.configure(bot);
      verify(bot.action(/^delete (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit delete event', () => {
      verify(emit(Events.Editing.DeleteItems, [ 'match 1' ]));
    });

    it('should send list', () => {
      verify(sendList(ctx, { shouldSendNotification: false }));
    });
  });
});
