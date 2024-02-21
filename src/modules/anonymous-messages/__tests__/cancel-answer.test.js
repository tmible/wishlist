import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

describe('anonymous-messages/cancel-answer module', () => {
  let cancelActionHandler;
  let CancelAnswerModule;

  beforeEach(async () => {
    cancelActionHandler = await replaceModule('@tmible/wishlist-bot/helpers/cancel-action-handler');
    CancelAnswerModule = await import('../cancel-answer.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_answer action handler', () => {
    const bot = object([ 'action' ]);
    CancelAnswerModule.configure(bot);
    verify(bot.action('cancel_answer', matchers.isA(Function)));
  });

  describe('cancel_answer action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelAnswerModule.configure(bot);
      verify(bot.action('cancel_answer', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
  });
});
