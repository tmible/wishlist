import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { Markup } from 'telegraf';
import resendListsMessages from '../resend-lists-messages.js';

describe('resendListsMessages', () => {
  let ctx;
  let reply;
  let pinChatMessage;
  let unpinChatMessage;
  let editMessageText;
  let editMessageReplyMarkup;
  let messageId;

  const sessionInitializer = () => ({
    pinnedMessageId: 'pinnedMessageId',
    messagesToEdit: [{ id: 1 }, { id: 2 }],
  });

  beforeEach(() => {
    reply = mock.fn((text) => Promise.resolve({
      message_id: ++messageId,
      chat: { id: 'chatId' },
      text,
      entities: `${messageId} entities`,
      reply_markup: `${messageId} reply markup`,
    }));
    pinChatMessage = mock.fn(async () => {});
    unpinChatMessage = mock.fn(async () => {});
    editMessageText = mock.fn(async () => {});
    editMessageReplyMarkup = mock.fn(async () => {});
    ctx = {
      chat: { id: 'chatId' },
      reply,
      pinChatMessage,
      unpinChatMessage,
      deleteMessage: async () => {},
      telegram: { editMessageText, editMessageReplyMarkup },
      session: { persistent: { lists: { userid: sessionInitializer() } } },
    };
    messageId = 0;
  });

  afterEach(() => mock.reset());

  it('should edit pinned message text', async () => {
    await resendListsMessages(
      ctx,
      'userid',
      [{ itemId: 'itemId', message: [ 'message 1' ] }],
      'titleMessageText',
      'outdatedTitleMessageText',
      {},
    );

    assert.deepEqual(
      editMessageText.mock.calls[0].arguments,
      [ 'chatId', 'pinnedMessageId', undefined, 'outdatedTitleMessageText' ],
    );
  });

  it('should add reply markup to pinned message on auto update', async () => {
    await resendListsMessages(
      ctx,
      'userid',
      [{ itemId: 'itemId', message: [ 'message 1' ] }],
      'titleMessageText',
      'outdatedTitleMessageText',
      { isAutoUpdate: true },
    );

    assert.deepEqual(
      editMessageText.mock.calls[0].arguments,
      [
        'chatId',
        'pinnedMessageId',
        undefined,
        'outdatedTitleMessageText',
        Markup.inlineKeyboard([
          Markup.button.callback('🔄 Обновить', 'manual_update userid'),
        ])
      ],
    );
  });

  it('should remove list messages reply markup', async () => {
    await resendListsMessages(
      ctx,
      'userid',
      [{ itemId: 'itemId', message: [ 'message 1' ] }],
      'titleMessageText',
      'outdatedTitleMessageText',
      {},
    );

    assert.deepEqual(
      editMessageReplyMarkup.mock.calls.map((call) => call.arguments),
      sessionInitializer().messagesToEdit.map(({ id }) => [ 'chatId', id ]),
    );
  });

  it('should not remove list messages reply markup on manual update', async () => {
    await resendListsMessages(
      ctx,
      'userid',
      [{ itemId: 'itemId', message: [ 'message 1' ] }],
      'titleMessageText',
      'outdatedTitleMessageText',
      { isManualUpdate: true },
    );

    assert.equal(editMessageReplyMarkup.mock.calls.length, 0);
  });

  describe('pinning title message', () => {
    it('should unpin outdated message if there is one', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [{ itemId: 'itemId', message: [ 'message 1' ] }],
        'titleMessageText',
        'outdatedTitleMessageText',
        {},
      );
      assert.deepEqual(unpinChatMessage.mock.calls[0].arguments, [ 'pinnedMessageId' ]);
    });

    it('should not unpin outdated message if there is none', async () => {
      ctx.session.persistent.lists.userid = {};
      await resendListsMessages(
        ctx,
        'userid',
        [{ itemId: 'itemId', message: [ 'message 1' ] }],
        'titleMessageText',
        'outdatedTitleMessageText',
        {},
      );
      assert.equal(unpinChatMessage.mock.calls.length, 0);
    });

    it('should send new message', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [{ itemId: 'itemId', message: [ 'message 1' ] }],
        'titleMessageText',
        'outdatedTitleMessageText',
        {},
      );
      assert.deepEqual(
        reply.mock.calls[0].arguments,
        [
          'titleMessageText',
          Markup.inlineKeyboard([
            [ Markup.button.callback('🔄 Обновить', 'update_list userid') ],
            [ Markup.button.callback('💬 Отправить новые сообщения', 'force_list userid') ],
          ]),
        ],
      );
    });

    it('should pin new message', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [{ itemId: 'itemId', message: [ 'message 1' ] }],
        'titleMessageText',
        'outdatedTitleMessageText',
        {},
      );
      assert.deepEqual(pinChatMessage.mock.calls[0].arguments, [ messageId - 1 ]);
    });

    it('should save pinned message in session', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [{ itemId: 'itemId', message: [ 'message 1' ] }],
        'titleMessageText',
        'outdatedTitleMessageText',
        {},
      );
      assert.equal(ctx.session.persistent.lists.userid.pinnedMessageId, messageId - 1);
    });
  });

  it('should send new messages', async () => {
    const messages = [
      { itemId: 1, message: [ 'message 1' ] },
      { itemId: 2, message: [ 'message 2' ] },
    ];
    await resendListsMessages(
      ctx,
      'userid',
      messages,
      'titleMessageText',
      'outdatedTitleMessageText',
      {},
    );
    assert.deepEqual(
      reply.mock.calls.slice(1).map((call) => call.arguments),
      messages.map(({ message }) => message),
    );
  });

  it('should save messages in session', async () => {
    const messages = [
      { itemId: 1, message: [ 'message 1' ] },
      { itemId: 2, message: [ 'message 2' ] },
    ];
    await resendListsMessages(
      ctx,
      'userid',
      messages,
      'titleMessageText',
      'outdatedTitleMessageText',
      {},
    );
    assert.deepEqual(
      ctx.session.persistent.lists.userid.messagesToEdit,
      messages.map((_, i) => ({
        id: messageId - (messages.length - i - 1),
        itemId: i + 1,
        text: `message ${i + 1}`,
        entities: `${messageId - (messages.length - i - 1)} entities`,
        reply_markup: `${messageId - (messages.length - i - 1)} reply markup`,
      })),
    );
  });
});
