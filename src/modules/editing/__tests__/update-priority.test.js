import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import ItemPriorityPattern from '@tmible/wishlist-bot/constants/item-priority-pattern';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import Events from '@tmible/wishlist-bot/store/events';

describe('editing/update-priority module', () => {
  let initiateUpdate;
  let updateValue;
  let UpdatePriorityModule;

  beforeEach(async () => {
    [ initiateUpdate, updateValue ] = await Promise.all([
      (async () =>
        (await td.replaceEsm('../helpers/template-functions/initiate-update.js')).default
      )(),
      (async () =>
        (await td.replaceEsm('../helpers/template-functions/update-value.js')).default
      )(),
    ]);
    UpdatePriorityModule = (await import('../update-priority.js')).default;
  });

  afterEach(() => td.reset());

  it('should register update_priority action handler', () => {
    const bot = td.object([ 'action' ]);
    UpdatePriorityModule.configure(bot);
    td.verify(bot.action(/^update_priority ([\-\d]+)$/, td.matchers.isA(Function)));
  });

  describe('update_priority action handler', () => {
    it('should initiate update', async () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      UpdatePriorityModule.configure(bot);
      td.verify(bot.action(/^update_priority ([\-\d]+)$/, captor.capture()));
      await captor.value(ctx);
      td.verify(initiateUpdate(
        ctx,
        MessagePurposeType.UpdatePriority,
        [
          td.matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(td.matchers.isA(String), 'cancel_update_priority'),
          ]),
        ],
      ));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    UpdatePriorityModule.messageHandler(bot);
    td.verify(bot.on('message', td.matchers.isA(Function)));
  });

  describe('message handler', () => {
    let ctx;
    let next;
    let captor;

    beforeEach(async () => {
      const bot = td.object([ 'on' ]);
      next = mock.fn(async () => {});
      ctx = {};
      captor = td.matchers.captor();
      UpdatePriorityModule.messageHandler(bot);
      td.verify(bot.on('message', captor.capture()));
      await captor.value(ctx, next);
    });

    afterEach(() => mock.reset());

    it('should update value', () => {
      td.verify(updateValue(
        ctx,
        MessagePurposeType.UpdatePriority,
        new RegExp(`^${ItemPriorityPattern}$`),
        td.matchers.isA(String),
        Events.Editing.UpdateItemPriority,
        td.matchers.isA(String),
      ));
    });

    it('should pass', () => {
      assert.equal(next.mock.calls.length, 1);
    });
  });
});
