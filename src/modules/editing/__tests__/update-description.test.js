import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';
import ItemDescriptionPattern from '../constants/item-description-pattern.const.js';

describe('editing/update-description module', () => {
  let initiateUpdate;
  let emit;
  let sendList;
  let UpdateDescriptionModule;

  beforeEach(async () => {
    [ initiateUpdate, { emit }, sendList ] = await Promise.all([
      (async () =>
        (await td.replaceEsm('../helpers/template-functions/initiate-update.js')).default
      )(),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
    ]);
    UpdateDescriptionModule = (await import('../update-description.js')).default;
  });

  afterEach(() => td.reset());

  it('should register update_description action handler', () => {
    const bot = td.object([ 'action' ]);
    UpdateDescriptionModule.configure(bot);
    td.verify(bot.action(/^update_description ([\-\d]+)$/, td.matchers.isA(Function)));
  });

  describe('update_description action handler', () => {
    it('should initiate update', async () => {
      const bot = td.object([ 'action' ]);
      const ctx = {};
      const captor = td.matchers.captor();
      UpdateDescriptionModule.configure(bot);
      td.verify(bot.action(/^update_description ([\-\d]+)$/, captor.capture()));
      await captor.value(ctx);
      td.verify(initiateUpdate(
        ctx,
        MessagePurposeType.UpdateDescription,
        [
          td.matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(td.matchers.isA(String), 'cancel_update_description'),
          ]),
        ],
      ));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    UpdateDescriptionModule.messageHandler(bot);
    td.verify(bot.on('message', td.matchers.isA(Function)));
  });

  describe('message handler', () => {
    let ctx;
    let next;
    let captor;

    beforeEach(() => {
      const bot = td.object([ 'on' ]);
      next = mock.fn(async () => {});
      captor = td.matchers.captor();
      UpdateDescriptionModule.messageHandler(bot);
      td.verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(() => {
        ctx = td.object({
          message: { text: '', entities: [{ type: 'type', offset: 0, length: 0 }] },
          reply: () => {},
          session: {
            messagePurpose: {
              type: MessagePurposeType.UpdateDescription,
              payload: 'itemId',
             },
          },
        });
      });

      it('should not pass', async () => {
        await captor.value(ctx, next);
        assert.equal(next.mock.calls.length, 0);
      });

      it('should remove message purpose from session', async () => {
        await captor.value(ctx, next);
        assert.deepEqual(ctx.session, {});
      });

      it('should reply if couldn\'t match message text and pattern', async () => {
        await captor.value(ctx, next);
        td.verify(ctx.reply(td.matchers.isA(String)));
      });

      describe('if message text matches pattern', () => {
        beforeEach(async () => {
          ctx.message.text = 'text';
          await captor.value(ctx, next);
        });

        it('should emit update description event', () => {
          td.verify(emit(
            Events.Editing.UpdateItemDescription,
            'itemId',
            'text',
            [{ type: 'type', offset: 0, length: 0 }],
          ));
        });

        it('should reply', () => {
          td.verify(ctx.reply(td.matchers.isA(String)));
        });

        it('should send list', () => {
          td.verify(sendList(ctx));
        });
      });
    });
  });
});
