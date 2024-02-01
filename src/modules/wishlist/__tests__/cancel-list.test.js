import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('wishlist/cancel-list module', () => {
  let cancelActionHandler;
  let CancelListModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      '@tmible/wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelListModule = (await import('../cancel-list.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_list action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelListModule.configure(bot);
    td.verify(bot.action('cancel_list', td.matchers.isA(Function)));
  });

  describe('cancel_list action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelListModule.configure(bot);
      td.verify(bot.action('cancel_list', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx, td.matchers.isA(String), false));
    });
  });
});
