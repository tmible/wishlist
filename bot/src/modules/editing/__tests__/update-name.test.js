import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import ItemNamePattern from '../constants/item-name-pattern.const.js';

const [ initiateUpdate, { inject }, updateValue ] = await Promise.all([
  replaceEsm('../helpers/template-functions/initiate-update.js').then((module) => module.default),
  replaceModule('@tmible/wishlist-bot/architecture/dependency-injector'),
  replaceEsm('../helpers/template-functions/update-value.js').then((module) => module.default),
]);
const UpdateNameModule = await import('../update-name.js').then((module) => module.default);

describe('editing/update-name module', () => {
  afterEach(reset);

  it('should register update_name action handler', () => {
    const bot = object([ 'action' ]);
    UpdateNameModule.configure(bot);
    verify(bot.action(/^update_name (\d+)$/, matchers.isA(Function)));
  });

  describe('update_name action handler', () => {
    it('should initiate update', async () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      UpdateNameModule.configure(bot);
      verify(bot.action(/^update_name (\d+)$/, captor.capture()));
      await captor.value(ctx);
      verify(initiateUpdate(
        ctx,
        MessagePurposeType.UpdateName,
        [
          matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'cancel_update_name'),
          ]),
        ],
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    UpdateNameModule.messageHandler(bot);
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
      UpdateNameModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
      await captor.value(ctx, next);
    });

    afterEach(() => mock.reset());

    it('should update value', () => {
      verify(updateValue(
        'event bus',
        ctx,
        MessagePurposeType.UpdateName,
        /* eslint-disable-next-line
          security/detect-non-literal-regexp,
          security-node/non-literal-reg-expr --
          Регулярное выражение из константы, так что тут нет уязвимости
        */
        new RegExp(`^${ItemNamePattern}$`),
        matchers.isA(String),
        Events.Editing.UpdateItemName,
        matchers.isA(String),
      ));
    });

    it('should pass', () => {
      assert.equal(next.mock.calls.length, 1);
    });
  });
});
