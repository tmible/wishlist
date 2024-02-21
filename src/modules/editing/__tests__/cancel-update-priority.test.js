import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-update-priority module', () => {
  let cancelActionHandler;
  let CancelUpdatePriorityModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelUpdatePriorityModule = await import('../cancel-update-priority.js')
      .then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_update_priority action handler', () => {
    const bot = object([ 'action' ]);
    CancelUpdatePriorityModule.configure(bot);
    verify(bot.action('cancel_update_priority', matchers.isA(Function)));
  });

  describe('cancel_update_priority action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelUpdatePriorityModule.configure(bot);
      verify(bot.action('cancel_update_priority', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
