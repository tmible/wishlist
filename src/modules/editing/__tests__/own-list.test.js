import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const subscribe = func();
const bot = object([ 'action', 'command' ]);

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
  Пробелы для консистентности с другими элементами массива
*/
const [ { inject }, sendList ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/architecture/dependency-injector'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);

const OwnListModule = await import('../own-list.js').then((module) => module.default);

describe('editing/own-list module', () => {
  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn({ subscribe });
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
      verify(sendList({ subscribe }, ctx));
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
      verify(sendList({ subscribe }, ctx));
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
      verify(sendList({ subscribe }, ctx, { shouldForceNewMessages: true }));
    });
  });

  it('should register handle own list event handler', async () => {
    OwnListModule.configure(object([ 'action', 'command' ]));
    const captor = matchers.captor();
    verify(subscribe(Events.Wishlist.HandleOwnList, captor.capture()));
    await captor.value('ctx');
    verify(sendList({ subscribe }, 'ctx'));
  });
});
