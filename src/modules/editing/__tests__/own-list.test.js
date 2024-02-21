import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/own-list module', () => {
  let subscribe;
  let sendList;
  let OwnListModule;
  let bot;

  beforeEach(async () => {
    /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
      Пробелы для консистентности с другими элементами массива
    */
    [ { subscribe }, sendList ] = await Promise.all([
      resolveModule('@tmible/wishlist-bot/store/event-bus').then((path) => replaceEsm(path)),
      replaceEsm('../helpers/send-list.js').then((module) => module.default),
    ]);
    OwnListModule = await import('../own-list.js').then((module) => module.default);
    bot = object([ 'action', 'command' ]);
  });

  afterEach(reset);

  it('should register my_list command handler', () => {
    OwnListModule.configure(bot);
    verify(bot.command('my_list', matchers.isA(Function)));
  });

  describe('my_list command handler', () => {
    it('should send list', async () => {
      const ctx = {};
      const captor = matchers.captor();
      OwnListModule.configure(bot);
      verify(bot.command('my_list', captor.capture()));
      await captor.value(ctx);
      verify(sendList(ctx));
    });
  });

  it('should register update_own_list action handler', () => {
    OwnListModule.configure(bot);
    verify(bot.action('update_own_list', matchers.isA(Function)));
  });

  describe('update_own_list action handler', () => {
    it('should send list', async () => {
      const ctx = {};
      const captor = matchers.captor();
      OwnListModule.configure(bot);
      verify(bot.action('update_own_list', captor.capture()));
      await captor.value(ctx);
      verify(sendList(ctx));
    });
  });

  it('should register force_own_list action handler', () => {
    OwnListModule.configure(bot);
    verify(bot.action('force_own_list', matchers.isA(Function)));
  });

  describe('force_own_list action handler', () => {
    it('should send list', async () => {
      const ctx = {};
      const captor = matchers.captor();
      OwnListModule.configure(bot);
      verify(bot.action('force_own_list', captor.capture()));
      await captor.value(ctx);
      verify(sendList(ctx, { shouldForceNewMessages: true }));
    });
  });

  it('should register handle own list event handler', () => {
    OwnListModule.configure(object([ 'action', 'command' ]));
    verify(subscribe(Events.Wishlist.HandleOwnList, sendList));
  });
});
