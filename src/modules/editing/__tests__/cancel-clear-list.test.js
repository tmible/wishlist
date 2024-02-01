import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-clear-list module', () => {
  let cancelActionHandler;
  let CancelClearListModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      '@tmible/wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelClearListModule = (await import('../cancel-clear-list.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_clear_list action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelClearListModule.configure(bot);
    td.verify(bot.action('cancel_clear_list', td.matchers.isA(Function)));
  });

  describe('cancel_clear_list action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelClearListModule.configure(bot);
      td.verify(bot.action('cancel_clear_list', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx, td.matchers.isA(String), false));
    });
  });
});
