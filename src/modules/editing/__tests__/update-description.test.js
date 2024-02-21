import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import Events from '@tmible/wishlist-bot/store/events';

const [ initiateUpdate, { emit }, sendList ] = await Promise.all([
  replaceEsm('../helpers/template-functions/initiate-update.js').then((module) => module.default),
  replaceModule('@tmible/wishlist-bot/store/event-bus'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);
const UpdateDescriptionModule = await import('../update-description.js')
  .then((module) => module.default);

describe('editing/update-description module', () => {
  afterEach(reset);

  it('should register update_description action handler', () => {
    const bot = object([ 'action' ]);
    UpdateDescriptionModule.configure(bot);
    verify(bot.action(/^update_description (\d+)$/, matchers.isA(Function)));
  });

  describe('update_description action handler', () => {
    it('should initiate update', async () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      UpdateDescriptionModule.configure(bot);
      verify(bot.action(/^update_description (\d+)$/, captor.capture()));
      await captor.value(ctx);
      verify(initiateUpdate(
        ctx,
        MessagePurposeType.UpdateDescription,
        [
          matchers.isA(String),
          Markup.inlineKeyboard([
            Markup.button.callback(matchers.isA(String), 'cancel_update_description'),
          ]),
        ],
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    UpdateDescriptionModule.messageHandler(bot);
    verify(bot.on('message', matchers.isA(Function)));
  });

  describe('message handler', () => {
    let ctx;
    let next;
    let captor;

    beforeEach(() => {
      const bot = object([ 'on' ]);
      next = mock.fn(async () => {});
      captor = matchers.captor();
      UpdateDescriptionModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(async () => {
        ctx = object({
          message: { text: 'text', entities: [{ type: 'type', offset: 0, length: 0 }] },
          reply: () => {},
          session: {
            messagePurpose: {
              type: MessagePurposeType.UpdateDescription,
              payload: 'itemId',
            },
          },
        });
        await captor.value(ctx, next);
      });

      it('should not pass', () => {
        assert.equal(next.mock.calls.length, 0);
      });

      it('should remove message purpose from session', () => {
        assert.deepEqual(ctx.session, {});
      });

      it('should emit update description event', () => {
        verify(emit(
          Events.Editing.UpdateItemDescription,
          'itemId',
          'text',
          [{ type: 'type', offset: 0, length: 0 }],
        ));
      });

      it('should reply', () => {
        verify(ctx.reply(matchers.isA(String)));
      });

      it('should send list', () => {
        verify(sendList(ctx));
      });
    });
  });
});
