import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-update-priority module', () => {
  let cancelActionHandler;
  let CancelUpdatePriorityModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      '@tmible/wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelUpdatePriorityModule = (await import('../cancel-update-priority.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_update_priority action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelUpdatePriorityModule.configure(bot);
    td.verify(bot.action('cancel_update_priority', td.matchers.isA(Function)));
  });

  describe('cancel_update_priority action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelUpdatePriorityModule.configure(bot);
      td.verify(bot.action('cancel_update_priority', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx));
    });
  });
});
