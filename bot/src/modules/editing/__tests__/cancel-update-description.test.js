import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelUpdateDescriptionModule = await import('../cancel-update-description.js')
  .then((module) => module.default);

describe('editing/cancel-update-description module', () => {
  afterEach(reset);

  it('should register cancel_update_description action handler', () => {
    const bot = object([ 'action' ]);
    CancelUpdateDescriptionModule.configure(bot);
    verify(bot.action('cancel_update_description', matchers.isA(Function)));
  });

  describe('cancel_update_description action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelUpdateDescriptionModule.configure(bot);
      verify(bot.action('cancel_update_description', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
