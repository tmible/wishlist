import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('wishlist/cooperate module', () => {
  let emit;
  let sendList;
  let CooperateModule;

  beforeEach(async () => {
    [ { emit }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    CooperateModule = (await import('../cooperate.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cooperate action handler', () => {
    const bot = td.object([ 'action' ]);
    CooperateModule.configure(bot);
    td.verify(bot.action(/^cooperate (\d+) (\d+)$/, td.matchers.isA(Function)));
  });

  describe('cooperate action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'action' ]);
      ctx = { from: { id: 'fromId' }, match: [ null, '1', '2' ] };
      const captor = td.matchers.captor();
      CooperateModule.configure(bot);
      td.verify(bot.action(/^cooperate (\d+) (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit cooperate event', () => {
      td.verify(emit(Events.Wishlist.CooperateOnItem, 1, 'fromId'));
    });

    it('should send list', () => {
      td.verify(sendList(ctx, 2));
    });
  });
});
