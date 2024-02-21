import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-update-description module', () => {
  let cancelActionHandler;
  let CancelUpdateDescriptionModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelUpdateDescriptionModule = await import('../cancel-update-description.js')
      .then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_update_description action handler', () => {
    const bot = object([ 'action' ]);
    CancelUpdateDescriptionModule.configure(bot);
    verify(bot.action('cancel_update_description', matchers.isA(Function)));
  });

  describe('cancel_update_description action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelUpdateDescriptionModule.configure(bot);
      verify(bot.action('cancel_update_description', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
