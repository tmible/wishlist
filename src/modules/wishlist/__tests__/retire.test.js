import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';
import Events from 'wishlist-bot/store/events';

describe('wishlist/retire module', () => {
  let emit;
  let sendList;
  let RetireModule;

  beforeEach(async () => {
    [ { emit }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    RetireModule = (await import('../retire/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register retire action handler', () => {
    const bot = td.object([ 'action' ]);
    RetireModule.configure(bot);
    td.verify(bot.action(/^retire (\d+) ([0-9]+)$/, td.matchers.isA(Function)));
  });

  describe('retire action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'action' ]);
      ctx = { from: { id: 'fromId' }, match: [ null, 'match 1', 'match 2' ] };
      const captor = td.matchers.captor();
      RetireModule.configure(bot);
      td.verify(bot.action(/^retire (\d+) ([0-9]+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit retire event', () => {
      td.verify(emit(Events.Wishlist.RetireFromItem, 'match 1', 'fromId'));
    });

    it('should send list', () => {
      td.verify(sendList(ctx, 'match 2'));
    });
  });
});
