import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('editing/cancel-add module', () => {
  let cancelActionHandler;
  let CancelAddModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      'wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelAddModule = (await import('../cancel-add/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_add action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelAddModule.configure(bot);
    td.verify(bot.action('cancel_add', td.matchers.isA(Function)));
  });

  describe('cancel_add action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelAddModule.configure(bot);
      td.verify(bot.action('cancel_add', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx, td.matchers.isA(String), false));
    });
  });
});
