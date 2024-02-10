import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import * as td from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('wishlist/list module', () => {
  let isUserInChat;
  let isChatGroup;
  let emit;
  let subscribe;
  let sendMessageAndMarkItForMarkupRemove;
  let sendList;
  let getUseridFromInput;
  let ListModule;
  let ctx;
  let captor;
  let userid;

  beforeEach(async () => {
    [
      isUserInChat,
      isChatGroup,
      { emit, subscribe },
      { sendMessageAndMarkItForMarkupRemove },
      sendList,
      getUseridFromInput,
    ] = await Promise.all([
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/is-user-in-chat',
        ))).default
      )(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/is-chat-group',
        ))).default
      )(),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/store/event-bus')),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/helpers/middlewares/remove-markup')),
      (async () => (await td.replaceEsm('../helpers/send-list.js')).default)(),
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/get-userid-from-input',
        ))).default
      )(),
    ]);
    ListModule = (await import('../list.js')).default;
  });

  afterEach(() => td.reset());

  const handleListCommandTestCases = [{
    name: 'should not send list if user is in chat',
    test: async () => {
      td.when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(true);
      await captor.value(ctx, userid);
      td.verify(sendList(), { ignoreExtraArgs: true, times: 0 });
    },
  }, {
    name: 'should not send list if user requests own list in group',
    test: async () => {
      td.when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(false);
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(true);
      ctx.from.id = 123;
      await captor.value(ctx, userid);
      td.verify(sendList(), { ignoreExtraArgs: true, times: 0 });
    },
  }, {
    name: 'should emit own list event if user requests own list in private chat',
    test: async () => {
      td.when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(false);
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      ctx.from.id = 123;
      await captor.value(ctx, userid);
      td.verify(emit(Events.Wishlist.HandleOwnList, ctx));
    },
  }, {
    name: 'should not send list if user requests own list in private chat',
    test: async () => {
      td.when(isUserInChat(), { ignoreExtraArgs: true }).thenResolve(false);
      td.when(isChatGroup(), { ignoreExtraArgs: true }).thenReturn(false);
      ctx.from.id = 123;
      await captor.value(ctx, userid);
      td.verify(sendList(), { ignoreExtraArgs: true, times: 0 });
    },
  }];

  it('should register list command handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    ListModule.configure(bot);
    td.verify(bot.command('list', td.matchers.isA(Function)));
  });

  describe('list command handler', () => {
    beforeEach(() => {
      const bot = td.object([ 'action', 'command' ]);
      ctx = {
        chat: {},
        from: { id: 'fromId' },
        message: { text: 'text' },
        reply: () => {},
        session: {},
      };
      captor = td.matchers.captor();
      ListModule.configure(bot);
      td.verify(bot.command('list', captor.capture()));
      td.when(
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
        td.verify(sendMessageAndMarkItForMarkupRemove(
          ctx,
          'reply',
          td.matchers.isA(String),
          Markup.inlineKeyboard([ Markup.button.callback(td.matchers.isA(String), 'cancel_list') ]),
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
        td.verify(sendList(ctx, 123, 'username', { shouldSendNotification: true }));
      });
    });
  });

  it('should register force_list action handler', () => {
    const bot = td.object([ 'action', 'command' ]);
    ListModule.configure(bot);
    td.verify(bot.action(/^force_list ([0-9]+)$/, td.matchers.isA(Function)));
  });

  describe('force_list action handler', () => {
    it('should send list', async () => {
      const bot = td.object([ 'action', 'command' ]);
      ctx = { match: [ null, 123 ] };
      captor = td.matchers.captor();
      td.when(emit(Events.Usernames.GetUsernameByUserid, 123)).thenReturn('username');
      ListModule.configure(bot);
      td.verify(bot.action(/^force_list ([0-9]+)$/, captor.capture()));
      await captor.value(ctx);
      td.verify(sendList(ctx, 123, 'username', { shouldForceNewMessages: true }));
    });
  });

  it('should register handle list link event handler', () => {
    ListModule.configure(td.object([ 'action', 'command' ]));
    td.verify(subscribe(Events.Wishlist.HandleListLink, td.matchers.isA(Function)));
  });

  describe('handle list link event handler', () => {
    beforeEach(() => {
      ctx = { from: { id: 'fromId' }, reply: () => {} };
      userid = 123;
      captor = td.matchers.captor();
      ListModule.configure(td.object([ 'action', 'command' ]));
      td.verify(subscribe(Events.Wishlist.HandleListLink, captor.capture()));
      td.when(
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
      td.verify(sendList(ctx, userid, 'username', { shouldSendNotification: true }));
    });
  });

  it('should register message handler', () => {
    const bot = td.object([ 'on' ]);
    ListModule.messageHandler(bot);
    td.verify(bot.on('message', td.matchers.isA(Function)));
  });

  describe('message handler', () => {
    let next;

    beforeEach(() => {
      const bot = td.object([ 'on' ]);
      next = mock.fn(async () => {});
      captor = td.matchers.captor();
      ListModule.messageHandler(bot);
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
          chat: {},
          from: { id: 'fromId' },
          message: { text: 'text' },
          reply: () => {},
          session: {
            messagePurpose: {
              type: MessagePurposeType.WishlistOwnerUsername,
            },
          },
        });
        td.when(
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
        td.verify(sendList(ctx, 123, 'username', { shouldSendNotification: true }));
      });
    });
  });
});
