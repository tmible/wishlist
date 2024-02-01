import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('editing/cancel-update-name module', () => {
  let cancelActionHandler;
  let CancelUpdateNameModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      'wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelUpdateNameModule = (await import('../cancel-update-name/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_update_name action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelUpdateNameModule.configure(bot);
    td.verify(bot.action('cancel_update_name', td.matchers.isA(Function)));
  });

  describe('cancel_update_name action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelUpdateNameModule.configure(bot);
      td.verify(bot.action('cancel_update_name', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx));
    });
  });
});
