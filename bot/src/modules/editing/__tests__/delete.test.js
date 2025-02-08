import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const emit = func();
const bot = object([ 'action' ]);

const [ { inject }, sendList ] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);

const DeleteModule = await import('../delete.js').then((module) => module.default);

describe('editing/delete module', () => {
  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit });
  });

  afterEach(reset);

  it('should register delete action handler', () => {
    DeleteModule.configure(bot);
    verify(bot.action(/^delete (\d+)$/, matchers.isA(Function)));
  });

  describe('delete action handler', () => {
    let ctx;

    beforeEach(async () => {
      ctx = { match: [ null, 'match 1' ] };
      const captor = matchers.captor();
      DeleteModule.configure(bot);
      verify(bot.action(/^delete (\d+)$/, captor.capture()));
      await captor.value(ctx);
    });

    it('should emit delete event', () => {
      verify(emit(Events.Editing.DeleteItems, [ 'match 1' ]));
    });

    it('should send list', () => {
      verify(sendList({ emit }, ctx, { shouldSendNotification: false }));
    });
  });
});
