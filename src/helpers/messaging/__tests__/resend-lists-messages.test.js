import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
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
    messagesToEditIds: [ 1, 2 ],
  });

  beforeEach(() => {
    reply = mock.fn((text) => new Promise(
      (resolve) => resolve({ message_id: ++messageId, chat: { id: 'chatId' }, text })),
    );
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
      [[ 'message 1' ]],
      'titleMessageText',
      'outdatedTitleMessageText',
    );

    assert.deepEqual(
      editMessageText.mock.calls[0].arguments,
      [ 'chatId', 'pinnedMessageId', undefined, 'outdatedTitleMessageText' ],
    );
  });

  it('should remove list messages reply markup', async () => {
    await resendListsMessages(
      ctx,
      'userid',
      [[ 'message 1' ]],
      'titleMessageText',
      'outdatedTitleMessageText',
    );

    assert.deepEqual(
      editMessageReplyMarkup.mock.calls.map((call) => call.arguments),
      sessionInitializer().messagesToEditIds.map(
        (messagesToEditId) => [ 'chatId', messagesToEditId ],
      ),
    );
  });

  describe('pinning title message', () => {
    it('should unpin outdated message if there is one', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [[ 'message 1' ]],
        'titleMessageText',
        'outdatedTitleMessageText',
      );
      assert.deepEqual(unpinChatMessage.mock.calls[0].arguments, [ 'pinnedMessageId' ]);
    });

    it('should not unpin outdated message if there is none', async () => {
      ctx.session.persistent.lists.userid = {};
      await resendListsMessages(
        ctx,
        'userid',
        [[ 'message 1' ]],
        'titleMessageText',
        'outdatedTitleMessageText',
      );
      assert.equal(unpinChatMessage.mock.calls.length, 0);
    });

    it('should send new message', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [[ 'message 1' ]],
        'titleMessageText',
        'outdatedTitleMessageText',
      );
      assert.deepEqual(reply.mock.calls[0].arguments, [ 'titleMessageText' ]);
    });

    it('should pin new message', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [[ 'message 1' ]],
        'titleMessageText',
        'outdatedTitleMessageText',
      );
      assert.deepEqual(pinChatMessage.mock.calls[0].arguments, [ messageId - 1 ]);
    });

    it('should save pinned message in session', async () => {
      await resendListsMessages(
        ctx,
        'userid',
        [[ 'message 1' ]],
        'titleMessageText',
        'outdatedTitleMessageText',
      );
      assert.equal(ctx.session.persistent.lists.userid.pinnedMessageId, messageId - 1);
    });
  });

  it('should send new messages', async () => {
    const messages = [[ 'message 1' ], [ 'message 2' ]];
    await resendListsMessages(
      ctx,
      'userid',
      messages,
      'titleMessageText',
      'outdatedTitleMessageText',
    );
    assert.deepEqual(reply.mock.calls.slice(1).map((call) => call.arguments), messages);
  });

  it('should save messages in session', async () => {
    const messages = [[ 'message 1' ], [ 'message 2' ]];
    await resendListsMessages(
      ctx,
      'userid',
      messages,
      'titleMessageText',
      'outdatedTitleMessageText',
    );
    assert.deepEqual(
      ctx.session.persistent.lists.userid.messagesToEditIds,
      messages.map((_, i) => messageId - (messages.length - i - 1)),
    );
  });
});
