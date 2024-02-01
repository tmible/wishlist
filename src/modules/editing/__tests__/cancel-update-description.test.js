import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('editing/cancel-update-description module', () => {
  let cancelActionHandler;
  let CancelUpdateDescriptionModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      'wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelUpdateDescriptionModule = (await import('../cancel-update-description/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_update_description action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelUpdateDescriptionModule.configure(bot);
    td.verify(bot.action('cancel_update_description', td.matchers.isA(Function)));
  });

  describe('cancel_update_description action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelUpdateDescriptionModule.configure(bot);
      td.verify(bot.action('cancel_update_description', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx));
    });
  });
});
