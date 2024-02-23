import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import { func, matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const emit = func();
const subscribe = func();

const [
  { inject },
  getUseridFromInput,
  isUserInChat,
  isChatGroup,
  { sendMessageAndMarkItForMarkupRemove },
  sendList,
] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/architecture/dependency-injector'),
  replaceModule('@tmible/wishlist-bot/helpers/get-userid-from-input'),
  replaceModule('@tmible/wishlist-bot/helpers/is-user-in-chat'),
  replaceModule('@tmible/wishlist-bot/helpers/is-chat-group'),
  replaceModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup'),
  replaceEsm('../helpers/send-list.js').then((module) => module.default),
]);
const ListModule = await import('../list.js').then((module) => module.default);

describe('wishlist/list module', () => {
  let ctx;
  let captor;
  let userid;

  beforeEach(() => {
    when(inject(), { ignoreExtraArgs: true }).thenReturn({ emit, subscribe });
  });

  afterEach(reset);

  const handleListCommandTestCases = [{
    name: 'should not send list if user is in chat',
    test: async () => {
      when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(true);
      await captor.value(ctx, userid);
      verify(sendList(), { ignoreExtraArgs: true, times: 0 });
    },
  }, {
    name: 'should not send list if user requests own list in group',
    test: async () => {
      when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(false);
      when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(true);
      ctx.from.id = 123;
      await captor.value(ctx, userid);
      verify(sendList(), { ignoreExtraArgs: true, times: 0 });
    },
  }, {
    name: 'should emit own list event if user requests own list in private chat',
    test: async () => {
      when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(false);
      when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      ctx.from.id = 123;
      await captor.value(ctx, userid);
      verify(emit(Events.Wishlist.HandleOwnList, ctx));
    },
  }, {
    name: 'should not send list if user requests own list in private chat',
    test: async () => {
      when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(false);
      when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      ctx.from.id = 123;
      await captor.value(ctx, userid);
      verify(sendList(), { ignoreExtraArgs: true, times: 0 });
    },
  }];

  it('should register list command handler', () => {
    const bot = object([ 'action', 'command' ]);
    ListModule.configure(bot);
    verify(bot.command('list', matchers.isA(Function)));
  });

  describe('list command handler', () => {
    beforeEach(() => {
      const bot = object([ 'action', 'command' ]);
      ctx = {
        chat: {},
        from: { id: 'fromId' },
        message: { text: 'text' },
        reply: () => {},
        session: {},
      };
      captor = matchers.captor();
      ListModule.configure(bot);
      verify(bot.command('list', captor.capture()));
      when(
        getUseridFromInput(),
        { ignoreExtraArgs: true },
      ).thenReturn(
        [ 123, 'username' ],
      );
    });

    describe('if there is no payload', () => {
      it('should save message purpose in session', async () => {
        await captor.value(ctx);
        assert.deepEqual(
          ctx.session.messagePurpose,
          { type: MessagePurposeType.WishlistOwnerUsername },
        );
      });

      it('should reply', async () => {
        await captor.value(ctx);
        verify(sendMessageAndMarkItForMarkupRemove(
          ctx,
          'reply',
          matchers.isA(String),
          Markup.inlineKeyboard([ Markup.button.callback(matchers.isA(String), 'cancel_list') ]),
        ));
      });
    });

    describe('if there is payload', () => {
      beforeEach(() => {
        ctx.payload = 'payload';
      });

      for (const { name, test } of handleListCommandTestCases) {
        it(name, test);
      }

      it('should send list', async () => {
        await captor.value(ctx);
        verify(sendList(
          { emit, subscribe },
          ctx,
          123,
          'username',
          { shouldSendNotification: true },
        ));
      });
    });
  });

  it('should register update_list action handler', () => {
    const bot = object([ 'action', 'command' ]);
    ListModule.configure(bot);
    verify(bot.action(/^update_list (\d+)$/, matchers.isA(Function)));
  });

  describe('update_list action handler', () => {
    it('should send list', async () => {
      const bot = object([ 'action', 'command' ]);
      ctx = { match: [ null, 123 ] };
      captor = matchers.captor();
      when(emit(Events.Usernames.GetUsernameByUserid, 123)).thenReturn('username');
      ListModule.configure(bot);
      verify(bot.action(/^update_list (\d+)$/, captor.capture()));
      await captor.value(ctx);
      verify(sendList({ emit, subscribe }, ctx, 123, 'username', { shouldSendNotification: true }));
    });
  });

  it('should register force_list action handler', () => {
    const bot = object([ 'action', 'command' ]);
    ListModule.configure(bot);
    verify(bot.action(/^force_list (\d+)$/, matchers.isA(Function)));
  });

  describe('force_list action handler', () => {
    it('should send list', async () => {
      const bot = object([ 'action', 'command' ]);
      ctx = { match: [ null, 123 ] };
      captor = matchers.captor();
      when(emit(Events.Usernames.GetUsernameByUserid, 123)).thenReturn('username');
      ListModule.configure(bot);
      verify(bot.action(/^force_list (\d+)$/, captor.capture()));
      await captor.value(ctx);
      verify(sendList({ emit, subscribe }, ctx, 123, 'username', { shouldForceNewMessages: true }));
    });
  });

  it('should register manual_update action handler', () => {
    const bot = object([ 'action', 'command' ]);
    ListModule.configure(bot);
    verify(bot.action(/^manual_update (\d+)$/, matchers.isA(Function)));
  });

  describe('manual_update action handler', () => {
    it('should send list', async () => {
      const bot = object([ 'action', 'command' ]);
      ctx = { match: [ null, 123 ] };
      captor = matchers.captor();
      when(emit(Events.Usernames.GetUsernameByUserid, 123)).thenReturn('username');
      ListModule.configure(bot);
      verify(bot.action(/^manual_update (\d+)$/, captor.capture()));
      await captor.value(ctx);
      verify(sendList(
        { emit, subscribe },
        ctx,
        123,
        'username',
        { shouldForceNewMessages: true, isManualUpdate: true },
      ));
    });
  });

  it('should register handle list link event handler', () => {
    ListModule.configure(object([ 'action', 'command' ]));
    verify(subscribe(Events.Wishlist.HandleListLink, matchers.isA(Function)));
  });

  describe('handle list link event handler', () => {
    beforeEach(() => {
      ctx = { from: { id: 'fromId' }, reply: () => {} };
      userid = 123;
      captor = matchers.captor();
      ListModule.configure(object([ 'action', 'command' ]));
      verify(subscribe(Events.Wishlist.HandleListLink, captor.capture()));
      when(
        getUseridFromInput(),
        { ignoreExtraArgs: true },
      ).thenReturn(
        [ userid, 'username' ],
      );
    });

    for (const { name, test } of handleListCommandTestCases) {
      it(name, test);
    }

    it('should send list', async () => {
      await captor.value(ctx, userid);
      verify(sendList(
        { emit, subscribe },
        ctx,
        userid,
        'username',
        { shouldSendNotification: true },
      ));
    });
  });

  it('should register message handler', () => {
    const bot = object([ 'on' ]);
    ListModule.messageHandler(bot);
    verify(bot.on('message', matchers.isA(Function)));
  });

  describe('message handler', () => {
    let next;

    beforeEach(() => {
      const bot = object([ 'on' ]);
      next = mock.fn();
      captor = matchers.captor();
      ListModule.messageHandler(bot);
      verify(bot.on('message', captor.capture()));
    });

    afterEach(() => mock.reset());

    it('should pass if there is no message purpose in session', async () => {
      await captor.value({ session: {} }, next);
      assert.equal(next.mock.calls.length, 1);
    });

    describe('if there is message purpose in session', () => {
      beforeEach(() => {
        ctx = object({
          chat: {},
          from: { id: 'fromId' },
          message: { text: 'text' },
          reply: () => {},
          /* eslint-disable @stylistic/js/object-curly-newline -- Переносы строк для читаемости */
          session: {
            messagePurpose: {
              type: MessagePurposeType.WishlistOwnerUsername,
            },
          },
          /* eslint-enable @stylistic/js/object-curly-newline */
        });
        when(
          getUseridFromInput(),
          { ignoreExtraArgs: true },
        ).thenReturn(
          [ 123, 'username' ],
        );
      });

      it('should not pass', async () => {
        await captor.value(ctx, next);
        assert.equal(next.mock.calls.length, 0);
      });

      it('should remove message purpose from session', async () => {
        await captor.value(ctx, next);
        assert.deepEqual(ctx.session, {});
      });

      for (const { name, test } of handleListCommandTestCases) {
        it(name, test);
      }

      it('should send list', async () => {
        await captor.value(ctx, next);
        verify(sendList(
          { emit, subscribe },
          ctx,
          123,
          'username',
          { shouldSendNotification: true },
        ));
      });
    });
  });
});
