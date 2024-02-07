import { afterEach, beforeEach,describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/own-list module', () => {
  let subscribe;
  let sendList;
  let OwnListModule;

  beforeEach(async () => {
    [ { subscribe }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    OwnListModule = (await import('../own-list.js')).default;
  });

  afterEach(() => td.reset());

  it('should register my_list command handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    OwnListModule.configure(bot);
    td.verify(bot.command('my_list', td.matchers.isA(Function)));
  });

  describe('my_list command handler', () => {
    it('should send list', async () => {
      const bot = td.object([ 'action', 'command' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      OwnListModule.configure(bot);
      td.verify(bot.command('my_list', captor.capture()));
      await captor.value(ctx);
      td.verify(sendList(ctx, false));
    });
  });

  it('should register force_own_list action handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    OwnListModule.configure(bot);
    td.verify(bot.action('force_own_list', td.matchers.isA(Function)));
  });

  describe('force_own_list action handler', () => {
    it('should send list', async () => {
      const bot = td.object([ 'action', 'command' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      OwnListModule.configure(bot);
      td.verify(bot.action('force_own_list', captor.capture()));
      await captor.value(ctx);
      td.verify(sendList(ctx, true));
    });
  });

  it('should register handle own list event handler', () => {
    OwnListModule.configure(td.object([ 'action', 'command' ]));
    td.verify(subscribe(Events.Wishlist.HandleOwnList, sendList));
  });
});
