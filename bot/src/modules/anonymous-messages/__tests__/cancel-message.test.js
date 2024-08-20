import { afterEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const cancelActionHandler = await replaceModule(
  '@tmible/wishlist-bot/helpers/cancel-action-handler',
);
const CancelMessageModule = await import('../cancel-message.js').then((module) => module.default);

describe('anonymous-messages/cancel-message module', () => {
  afterEach(reset);

  it('should register cancel_message action handler', () => {
    const bot = object([ 'action' ]);
    CancelMessageModule.configure(bot);
    verify(bot.action('cancel_message', matchers.isA(Function)));
  });

  describe('cancel_message action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelMessageModule.configure(bot);
      verify(bot.action('cancel_message', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
