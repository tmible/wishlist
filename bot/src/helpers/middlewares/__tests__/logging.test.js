import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { explain, func, matchers, reset, verify, when } from 'testdouble';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import LoggingMiddlewareType from '@tmible/wishlist-bot/constants/logging-middleware-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const info = func();
const { inject } = await replaceModule('@tmible/wishlist-common/dependency-injector');
const logging = await import('../logging.js').then((module) => module.default);

describe('logging middleware', () => {
  it('should inject logger', () => {
    logging(LoggingMiddlewareType.AUXILARY_ACTIVITIES);
    verify(inject(InjectionToken.Logger));
  });

  describe('logging middleware', () => {
    let middleware;
    let ctx;

    beforeEach(() => {
      when(inject(InjectionToken.Logger)).thenReturn({ info });
      ctx = {
        chat: { id: 'chatId' },
        from: { id: 'fromId' },
        update: { update_id: 'updateId' },
      };
    });

    afterEach(reset);

    it('should log enriched message before next call', async () => {
      middleware = logging(LoggingMiddlewareType.AUXILARY_ACTIVITIES);
      await middleware(
        ctx,
        () => {
          verify(info(
            {
              chatId: 'chatId',
              userid: 'fromId',
              updateId: 'updateId',
            },
            'starting up',
          ));
        },
      );
    });

    it('should log enriched message after next call', async () => {
      middleware = logging(LoggingMiddlewareType.AUXILARY_ACTIVITIES);
      let infoCallsAsOfNextCall;
      const next = () => {
        infoCallsAsOfNextCall = explain(info).callCount;
      };
      await middleware(ctx, next);
      verify(info(
        {
          chatId: 'chatId',
          userid: 'fromId',
          updateId: 'updateId',
        },
        'finished clean up',
      ));
      assert.ok(explain(info).callCount > infoCallsAsOfNextCall);
    });

    it('should enrich message for command type updates', async () => {
      middleware = logging(LoggingMiddlewareType.UPDATE_PROCESSING);
      ctx.updateType = 'message';
      ctx.message = {
        entities: [{ type: 'bot_command', offset: 0, length: 8 }],
        text: '/command',
      };
      await middleware(ctx, () => {});
      verify(info(
        {
          chatId: 'chatId',
          userid: 'fromId',
          updateId: 'updateId',
          updateType: 'command',
          updatePayload: '/command',
        },
        matchers.isA(String),
      ));
    });

    it('should enrich message for text type updates', async () => {
      middleware = logging(LoggingMiddlewareType.UPDATE_PROCESSING);
      ctx.updateType = 'message';
      ctx.message = {};
      await middleware(ctx, () => {});
      verify(info(
        {
          chatId: 'chatId',
          userid: 'fromId',
          updateId: 'updateId',
          updateType: 'text message',
        },
        matchers.isA(String),
      ));
    });

    it('should enrich message for callback type updates', async () => {
      middleware = logging(LoggingMiddlewareType.UPDATE_PROCESSING);
      ctx.updateType = 'callback_query';
      ctx.callbackQuery = { data: 'callback data' };
      await middleware(ctx, () => {});
      verify(info(
        {
          chatId: 'chatId',
          userid: 'fromId',
          updateId: 'updateId',
          updateType: 'action',
          updatePayload: 'callback data',
        },
        matchers.isA(String),
      ));
    });

    it('should ignore other update types', async () => {
      middleware = logging(LoggingMiddlewareType.UPDATE_PROCESSING);
      ctx.updateType = undefined;
      await middleware(ctx, () => {});
      verify(info(
        {
          chatId: 'chatId',
          userid: 'fromId',
          updateId: 'updateId',
        },
        matchers.isA(String),
      ));
    });
  });
});
