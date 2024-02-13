import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('wishlist/book module', () => {
  let emit;
  let sendList;
  let BookModule;

  beforeEach(async () => {
    [ { emit }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    BookModule = (await import('../book.js')).default;
  });

  afterEach(() => td.reset());

  it('should register book action handler', () => {
    const bot = td.object([ 'action' ]);
    BookModule.configure(bot);
    td.verify(bot.action(/^book (\d+) (\d+)$/, td.matchers.isA(Function)));
  });

  describe('book action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'action' ]);
      ctx = { from: { id: 'fromId' }, match: [ null, '1', '2' ] };
      const captor = td.matchers.captor();
      BookModule.configure(bot);
      td.verify(bot.action(/^book (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit book event', () => {
      td.verify(emit(Events.Wishlist.BookItem, 1, 'fromId'));
    });

    it('should send list', () => {
      td.verify(sendList(ctx, 2));
    });
  });
});
