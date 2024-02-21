import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelAddModule = await import('../cancel-add.js').then((module) => module.default);

describe('editing/cancel-add module', () => {
  afterEach(reset);

  it('should register cancel_add action handler', () => {
    const bot = object([ 'action' ]);
    CancelAddModule.configure(bot);
    verify(bot.action('cancel_add', matchers.isA(Function)));
  });

  describe('cancel_add action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelAddModule.configure(bot);
      verify(bot.action('cancel_add', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
