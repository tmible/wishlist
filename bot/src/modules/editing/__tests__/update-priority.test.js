import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import ItemPriorityPattern from '../constants/item-priority-pattern.const.js';

const [ initiateUpdate, { inject }, updateValue ] = await Promise.all([
  replaceEsm('../helpers/template-functions/initiate-update.js').then((module) => module.default),
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceEsm('../helpers/template-functions/update-value.js').then((module) => module.default),
]);
const UpdatePriorityModule = await import('../update-priority.js').then((module) => module.default);

describe('editing/update-priority module', () => {
  afterEach(reset);

  it('should register update_priority action handler', () => {
    const bot = object([ 'action' ]);
    UpdatePriorityModule.configure(bot);
    verify(bot.action(/^update_priority (\d+)$/, matchers.isA(Function)));
  });

  describe('update_priority action handler', () => {
    it('should initiate update', async () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      UpdatePriorityModule.configure(bot);
      verify(bot.action(/^update_priority (\d+)$/, captor.capture()));
      await captor.value(ctx);
      verify(initiateUpdate(
        ctx,
        MessagePurposeType.UpdatePriority,
        [
          matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'cancel_update_priority'),
          ]),
        ],
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    UpdatePriorityModule.messageHandler(bot);
    verify(bot.on('message', matchers.isA(Function)));
  });

  describe('message handler', () => {
    let ctx;
    let next;
    let captor;

    beforeEach(async () => {
      const bot = object([ 'on' ]);
      next = mock.fn();
      ctx = {};
      captor = matchers.captor();
      when(inject(), { ignoreExtraArgs: true }).thenReturn('event bus');
      UpdatePriorityModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
      await captor.value(ctx, next);
    });

    afterEach(() => mock.reset());

    it('should update value', () => {
      verify(updateValue(
        'event bus',
        ctx,
        MessagePurposeType.UpdatePriority,
        /* eslint-disable-next-line
          security/detect-non-literal-regexp,
          security-node/non-literal-reg-expr --
          Регулярное выражение из константы, так что тут нет уязвимости
        */
        new RegExp(`^${ItemPriorityPattern}$`),
        matchers.isA(String),
        Events.Editing.UpdateItemPriority,
        matchers.isA(String),
      ));
    });

    it('should pass', () => {
      assert.equal(next.mock.calls.length, 1);
    });
  });
});
