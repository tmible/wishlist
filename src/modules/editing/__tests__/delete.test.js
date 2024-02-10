import { afterEach, beforeEach,describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/delete module', () => {
  let emit;
  let sendList;
  let DeleteModule;

  beforeEach(async () => {
    [ { emit }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    DeleteModule = (await import('../delete.js')).default;
  });

  afterEach(() => td.reset());

  it('should register delete action handler', () => {
    const bot = td.object([ 'action' ]);
    DeleteModule.configure(bot);
    td.verify(bot.action(/^delete ([\-\d]+)$/, td.matchers.isA(Function)));
  });

  describe('delete action handler', () => {
    let ctx;

    beforeEach(async () => {
      const bot = td.object([ 'action' ]);
      ctx = { match: [ null, 'match 1' ] };
      const captor = td.matchers.captor();
      DeleteModule.configure(bot);
      td.verify(bot.action(/^delete ([\-\d]+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit delete event', () => {
      td.verify(emit(Events.Editing.DeleteItems, [ 'match 1' ]));
    });

    it('should send list', () => {
      td.verify(sendList(ctx, { shouldSendNotification: false }));
    });
  });
});
