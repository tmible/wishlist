import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Format, Markup } from 'telegraf';
import { func, matchers, object, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const emit = func();
const bot = object([ 'command', 'action' ]);

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
  Пробелы для консистентности с другими элементами массива
*/
const [ isChatGroup, { inject } ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceModule('@tmible/wishlist-bot/architecture/dependency-injector'),
]);

const ClearListModule = await import('../clear-list.js').then((module) => module.default);

describe('editing/clear-list module', () => {
  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit });
  });

  afterEach(reset);

  it('should register clear_list command handler', () => {
    ClearListModule.configure(bot);
    verify(bot.command('clear_list', matchers.isA(Function)));
  });

  describe('clear_list command handler if chat isn\'t group', () => {
    let ctx;
    let captor;

    beforeEach(() => {
      ctx = object({
        from: { id: 'fromId' },
        reply: () => {},
        session: {},
      });
      captor = matchers.captor();
      ClearListModule.configure(bot);
      verify(bot.command('clear_list', captor.capture()));
      when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
    });

    afterEach(reset);

    it('should emit GetList event', async () => {
      when(emit(), { ignoreExtraArgs: true }).thenReturn([]);
      await captor.value(ctx);
      verify(emit(Events.Editing.GetList, 'fromId'));
    });

    it('should send message if list is empty', async () => {
      when(emit(), { ignoreExtraArgs: true }).thenReturn([]);
      await captor.value(ctx);
      verify(ctx.reply(matchers.isA(String)));
    });

    describe('if list is not empty', () => {
      const list = [{
        state: ListItemState.FREE,
        name: 'name 3',
        id: 3,
      }, {
        state: ListItemState.FREE,
        name: 'name 2',
        id: 2,
      }, {
        state: ListItemState.BOOKED,
        name: 'name 1',
        id: 1,
      }];

      const sortedList = [{
        state: ListItemState.BOOKED,
        name: 'name 1',
        id: 1,
      }, {
        state: ListItemState.FREE,
        name: 'name 2',
        id: 2,
      }, {
        state: ListItemState.FREE,
        name: 'name 3',
        id: 3,
      }];

      beforeEach(async () => {
        let messageId = 0;
        when(emit(), { ignoreExtraArgs: true }).thenReturn(list);
        when(ctx.reply(), { ignoreExtraArgs: true }).thenDo(() => {
          messageId += 1;
          return { message_id: messageId };
        });
        await captor.value(ctx);
      });

      afterEach(reset);

      it('should send prompt message', () => {
        verify(ctx.reply(matchers.isA(String)));
      });

      it('should send message with list item', () => {
        verify(ctx.reply(
          new Format.FmtString(
            'name 1',
            [{ offset: 0, length: 6, type: 'bold' }],
          ),
          Markup.inlineKeyboard([[
            Markup.button.callback('Нет', 'clear_list_no'),
            Markup.button.callback('Да', 'clear_list_yes'),
          ], [
            Markup.button.callback('🚫 Не очищать список', 'clear_list_end'),
          ]]),
        ));
      });

      it('should save data in session', () => {
        assert.deepEqual(
          ctx.session.listClearing,
          {
            list: sortedList,
            messageId: 2,
            promptMessageId: 1,
          },
        );
      });
    });
  });

  it('should register action handler', () => {
    ClearListModule.configure(bot);
    verify(bot.action(/^clear_list_(yes|no|end)$/, matchers.isA(Function)));
  });

  describe('action handler', () => {
    let ctx;
    let captor;

    beforeEach(() => {
      ctx = object({
        session: {
          listClearing: {
            list: {
              shift: () => {},
              length: 0,
            },
            promptMessageId: 'promptMessageId',
            messageId: 'messageId',
          },
        },
        match: [ null, '' ],
        telegram: {
          editMessageText: () => {},
          deleteMessage: () => {},
        },
        chat: { id: 'chatId' },
      });
      when(ctx.session.listClearing.list.shift()).thenReturn({ id: 1 });
      captor = matchers.captor();
      ClearListModule.configure(bot);
      verify(bot.action(/^clear_list_(yes|no|end)$/, captor.capture()));
    });

    afterEach(reset);

    it('should shift queue', async () => {
      let shiftCalls = 0;
      when(ctx.session.listClearing.list.shift()).thenDo(() => {
        shiftCalls += 1;
        return { id: 1 };
      });
      await captor.value(ctx);
      assert.equal(shiftCalls, 1);
    });

    it('should emit DeleteItems event', async () => {
      ctx.match[1] = 'yes';
      await captor.value(ctx);
      verify(emit(Events.Editing.DeleteItems, [ 1 ]));
    });

    const stopTests = [{
      name: 'should edit prompt message',
      test: async (captor, ctx) => {
        await captor.value(ctx);
        verify(ctx.telegram.editMessageText(
          'chatId',
          'promptMessageId',
          undefined,
          'Список очищен',
        ));
      },
    }, {
      name: 'should delete message with list item',
      test: async (captor, ctx) => {
        await captor.value(ctx);
        verify(ctx.telegram.deleteMessage('chatId', 'messageId'));
      },
    }, {
      name: 'should delete data from session',
      test: async (captor, ctx) => {
        await captor.value(ctx);
        assert.deepEqual(ctx.session, {});
      },
    }];

    describe('if user requested stop', () => {
      beforeEach(() => {
        ctx.session.listClearing.list.length = 1;
        ctx.session.listClearing.list[0] = { id: 2, name: 'name 2' };
        ctx.match[1] = 'end';
      });

      for (const { name, test } of stopTests) {
        it(name, async () => await test(captor, ctx));
      }
    });

    describe('if list is empty', () => {
      beforeEach(() => {
        ctx.session.listClearing.list.length = 0;
        ctx.match[1] = '';
      });

      for (const { name, test } of stopTests) {
        it(name, async () => await test(captor, ctx));
      }
    });

    it(
      'should edit message with list item if user answered yes or no and there are items in list',
      async () => {
        ctx.session.listClearing.list.length = 1;
        ctx.session.listClearing.list[0] = { id: 2, name: 'name 2' };
        await captor.value(ctx);
        verify(ctx.telegram.editMessageText(
          'chatId',
          'messageId',
          undefined,
          new Format.FmtString(
            'name 2',
            [{ offset: 0, length: 6, type: 'bold' }],
          ),
          Markup.inlineKeyboard([[
            Markup.button.callback('Нет', 'clear_list_no'),
            Markup.button.callback('Да', 'clear_list_yes'),
          ], [
            Markup.button.callback('🚫 Не очищать список', 'clear_list_end'),
          ]]),
        ));
      },
    );
  });
});
