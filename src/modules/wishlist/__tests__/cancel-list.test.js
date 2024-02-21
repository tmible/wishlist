import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelListModule = await import('../cancel-list.js').then((module) => module.default);

describe('wishlist/cancel-list module', () => {
  afterEach(reset);

  it('should register cancel_list action handler', () => {
    const bot = object([ 'action' ]);
    CancelListModule.configure(bot);
    verify(bot.action('cancel_list', matchers.isA(Function)));
  });

  describe('cancel_list action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelListModule.configure(bot);
      verify(bot.action('cancel_list', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
