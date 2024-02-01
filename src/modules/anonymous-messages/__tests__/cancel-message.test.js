import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('anonymous-messages/cancel-message module', () => {
  let cancelActionHandler;
  let CancelMessageModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      '@tmible/wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelMessageModule = (await import('../cancel-message.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_message action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelMessageModule.configure(bot);
    td.verify(bot.action('cancel_message', td.matchers.isA(Function)));
  });

  describe('cancel_message action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelMessageModule.configure(bot);
      td.verify(bot.action('cancel_message', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx, td.matchers.isA(String), false));
    });
  });
});
