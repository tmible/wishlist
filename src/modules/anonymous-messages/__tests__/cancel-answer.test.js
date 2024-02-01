import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('anonymous-messages/cancel-answer module', () => {
  let cancelActionHandler;
  let CancelAnswerModule;

  beforeEach(async () => {
    cancelActionHandler = (await td.replaceEsm(await resolveModule(
      'wishlist-bot/helpers/cancel-action-handler',
    ))).default;
    CancelAnswerModule = (await import('../cancel-answer/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register cancel_answer action handler', () => {
    const bot = td.object([ 'action' ]);
    CancelAnswerModule.configure(bot);
    td.verify(bot.action('cancel_answer', td.matchers.isA(Function)));
  });

  describe('cancel_answer action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      CancelAnswerModule.configure(bot);
      td.verify(bot.action('cancel_answer', captor.capture()));
      captor.value(ctx);
      td.verify(cancelActionHandler(ctx));
    });
  });
});
