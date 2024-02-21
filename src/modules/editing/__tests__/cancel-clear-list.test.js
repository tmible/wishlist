import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelClearListModule = await import('../cancel-clear-list.js')
  .then((module) => module.default);

describe('editing/cancel-clear-list module', () => {
  afterEach(reset);

  it('should register cancel_clear_list action handler', () => {
    const bot = object([ 'action' ]);
    CancelClearListModule.configure(bot);
    verify(bot.action('cancel_clear_list', matchers.isA(Function)));
  });

  describe('cancel_clear_list action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelClearListModule.configure(bot);
      verify(bot.action('cancel_clear_list', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
