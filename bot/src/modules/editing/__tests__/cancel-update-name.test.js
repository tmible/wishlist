import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelUpdateNameModule = await import('../cancel-update-name.js')
  .then((module) => module.default);

describe('editing/cancel-update-name module', () => {
  afterEach(reset);

  it('should register cancel_update_name action handler', () => {
    const bot = object([ 'action' ]);
    CancelUpdateNameModule.configure(bot);
    verify(bot.action('cancel_update_name', matchers.isA(Function)));
  });

  describe('cancel_update_name action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelUpdateNameModule.configure(bot);
      verify(bot.action('cancel_update_name', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
