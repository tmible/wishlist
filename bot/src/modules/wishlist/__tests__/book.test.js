import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const emit = func();

const [ { inject }, sendList ] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);

const BookModule = await import('../book.js').then((module) => module.default);

describe('wishlist/book module', () => {
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
      when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit });
      BookModule.configure(bot);
      verify(bot.action(/^book (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit book event', () => {
      verify(emit(Events.Wishlist.BookItem, 1, 'fromId'));
    });

    it('should send list', () => {
      verify(sendList({ emit }, ctx, 2));
    });
  });
});
