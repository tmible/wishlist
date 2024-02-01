import { afterEach, beforeEach,describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';
import Events from 'wishlist-bot/store/events';

describe('editing/edit module', () => {
  let subscribe;
  let sendList;
  let EditModule;

  beforeEach(async () => {
    [ { subscribe }, sendList ] = await Promise.all([
      td.replaceEsm(await resolveModule('wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    EditModule = (await import('../edit/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register edit command handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    EditModule.configure(bot);
    td.verify(bot.command('edit', td.matchers.isA(Function)));
  });

  describe('edit command handler', () => {
    it('should send list', async () => {
      const bot = td.object([ 'action', 'command' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      EditModule.configure(bot);
      td.verify(bot.command('edit', captor.capture()));
      await captor.value(ctx);
      td.verify(sendList(ctx, false));
    });
  });

  it('should register force_own_list action handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    EditModule.configure(bot);
    td.verify(bot.action('force_own_list', td.matchers.isA(Function)));
  });

  describe('force_own_list action handler', () => {
    it('should send list', async () => {
      const bot = td.object([ 'action', 'command' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      EditModule.configure(bot);
      td.verify(bot.action('force_own_list', captor.capture()));
      await captor.value(ctx);
      td.verify(sendList(ctx, true));
    });
  });

  it('should register handle own list event handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    EditModule.configure(bot);
    td.verify(subscribe(Events.Wishlist.HandleOwnList, sendList));
  });
});
