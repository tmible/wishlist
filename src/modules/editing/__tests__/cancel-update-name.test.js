import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-update-name module', () => {
  let cancelActionHandler;
  let CancelUpdateNameModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelUpdateNameModule = await import('../cancel-update-name.js')
      .then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_update_name action handler', () => {
    const bot = object([ 'action' ]);
    CancelUpdateNameModule.configure(bot);
    verify(bot.action('cancel_update_name', matchers.isA(Function)));
  });

  describe('cancel_update_name action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelUpdateNameModule.configure(bot);
      verify(bot.action('cancel_update_name', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
