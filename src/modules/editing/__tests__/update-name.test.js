import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import ItemNamePattern from 'wishlist-bot/constants/item-name-pattern';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import Events from 'wishlist-bot/store/events';

describe('editing/update-name module', () => {
  let initiateUpdate;
  let updateValue;
  let UpdateNameModule;

  beforeEach(async () => {
    [ initiateUpdate, updateValue ] = await Promise.all([
      (async () =>
        (await td.replaceEsm('../helpers/template-functions/initiate-update.js')).default
      )(),
      (async () =>
        (await td.replaceEsm('../helpers/template-functions/update-value.js')).default
      )(),
    ]);
    UpdateNameModule = (await import('../update-name/index.js')).default;
  });

  afterEach(() => td.reset());

  it('should register update_name action handler', () => {
    const bot = td.object([ 'action' ]);
    UpdateNameModule.configure(bot);
    td.verify(bot.action(/^update_name ([\-\d]+)$/, td.matchers.isA(Function)));
  });

  describe('update_name action handler', () => {
    it('should initiate update', async () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      UpdateNameModule.configure(bot);
      td.verify(bot.action(/^update_name ([\-\d]+)$/, captor.capture()));
      await captor.value(ctx);
      td.verify(initiateUpdate(
        ctx,
        MessagePurposeType.UpdateName,
        [
          td.matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(td.matchers.isA(String), 'cancel_update_name'),
          ]),
        ],
      ));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    UpdateNameModule.messageHandler(bot);
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
      UpdateNameModule.messageHandler(bot);
      td.verify(bot.on('message', captor.capture()));
      await captor.value(ctx, next);
    });

    afterEach(() => mock.reset());

    it('should update value', () => {
      td.verify(updateValue(
        ctx,
        MessagePurposeType.UpdateName,
        new RegExp(`^${ItemNamePattern}$`),
        td.matchers.isA(String),
        Events.Editing.UpdateItemName,
        td.matchers.isA(String),
      ));
    });

    it('should pass', () => {
      assert.equal(next.mock.calls.length, 1);
    });
  });
});
