import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelUpdatePriorityModule = await import('../cancel-update-priority.js')
  .then((module) => module.default);

describe('editing/cancel-update-priority module', () => {
  afterEach(reset);

  it('should register cancel_update_priority action handler', () => {
    const bot = object([ 'action' ]);
    CancelUpdatePriorityModule.configure(bot);
    verify(bot.action('cancel_update_priority', matchers.isA(Function)));
  });

  describe('cancel_update_priority action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelUpdatePriorityModule.configure(bot);
      verify(bot.action('cancel_update_priority', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
