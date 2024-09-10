import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const emit = func();

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
  Пробелы для консистентности с другими элементами массива
*/
const [ { inject }, sendList ] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
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
      when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit });
      RetireModule.configure(bot);
      verify(bot.action(/^retire (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit retire event', () => {
      verify(emit(Events.Wishlist.RetireFromItem, 1, 'fromId'));
    });

    it('should send list', () => {
      verify(sendList({ emit }, ctx, 2));
    });
  });
});
