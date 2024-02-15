import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import updateListsMessages from '../update-lists-messages.js';

describe('updateListsMessages', () => {
  let ctx;
  let reply;
  let pinChatMessage;
  let editMessageText;
  let deleteMessage;

  beforeEach(() => {
    reply = mock.fn((text) => new Promise(
      (resolve) => resolve({ message_id: 'messageId', chat: { id: 'chatId' }, text })),
    );
    pinChatMessage = mock.fn(async () => {});
    editMessageText = mock.fn(async () => {});
    deleteMessage = mock.fn(async () => {});
    ctx = {
      chat: { id: 'chatId' },
      reply,
      pinChatMessage,
      deleteMessage,
      telegram: { editMessageText },
      session: {
        persistent: {
          lists: {
            userid: {
              messagesToEdit: new Array(5).fill(null).map((_, i) => ({
                id: i + 1,
                itemId: i + 1,
                text: `message ${i + 1}`,
                entities: [],
                reply_markup: { inline_keyboard: [] },
              })),
              pinnedMessageId: 'pinnedMessageId',
            },
          },
        },
      },
    };
  });

  afterEach(() => mock.reset());

  it('should repin title message', async () => {
    await updateListsMessages(ctx, 'userid', []);
    assert.deepEqual(pinChatMessage.mock.calls[0].arguments, [ 'pinnedMessageId' ]);
  });

  describe('if messages numbers are equal', () => {
    let messages;

    beforeEach(() => {
      messages = [{
        itemId: 1,
        message: [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 3,
        message: [{ text: 'message 3', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 2,
        message: [{ text: 'message 2', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 4,
        message: [{ text: 'message 4', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 5,
        message: [
          { text: 'message 5 new', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }];
    });

    it('should edit only changed or moved messages', async () => {
      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        editMessageText.mock.calls.map((call) => call.arguments),
        [[
          ctx.chat.id,
          2,
          undefined,
          { text: 'message 3', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          3,
          undefined,
          { text: 'message 2', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          5,
          undefined,
          { text: 'message 5 new', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ]],
      );
    });

    it('should update messages in session', async () => {
      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        ctx.session.persistent.lists.userid.messagesToEdit,
        [{
          id: 1,
          itemId: 1,
          text: 'message 1',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 2,
          itemId: 3,
          text: 'message 3',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 3,
          itemId: 2,
          text: 'message 2',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 4,
          itemId: 4,
          text: 'message 4',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 5,
          itemId: 5,
          text: 'message 5 new',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }],
      );
    });
  });

  describe('if there are less new messages than old ones', () => {
    let messages;

    beforeEach(() => {
      messages = [{
        itemId: 3,
        message: [{ text: 'message 3', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 2,
        message: [{ text: 'message 2', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 6,
        message: [{ text: 'message 6', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      }, {
        itemId: 5,
        message: [
          { text: 'message 5 new', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }];
    });

    it('should edit only changed or moved messages', async () => {
      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        editMessageText.mock.calls.map((call) => call.arguments),
        [[
          ctx.chat.id,
          1,
          undefined,
          { text: 'message 3', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          3,
          undefined,
          { text: 'message 6', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          5,
          undefined,
          { text: 'message 5 new', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ]],
      );
    });

    it('should delete excess messages', async () => {
      await updateListsMessages(ctx, 'userid', messages, false);
      assert.deepEqual(deleteMessage.mock.calls.map((call) => call.arguments), [[ 4 ]]);
    });

    it('should update messages in session', async () => {
      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        ctx.session.persistent.lists.userid.messagesToEdit,
        [{
          id: 1,
          itemId: 3,
          text: 'message 3',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 2,
          itemId: 2,
          text: 'message 2',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 3,
          itemId: 6,
          text: 'message 6',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 5,
          itemId: 5,
          text: 'message 5 new',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }],
      );
    });
  });

  it('should not send notification if not requested', async () => {
    await updateListsMessages(ctx, 'userid', [], false);
    assert.equal(reply.mock.calls.length, 0);
  });

  describe('if notification is requested', () => {
    it('should send notification for foreign list', async () => {
      await updateListsMessages(ctx, 'userid', [], true);

      assert.deepEqual(
        reply.mock.calls[0].arguments,
        [
          'Список обновлён',
          {
            reply_markup: {
              inline_keyboard: [[{
                callback_data: 'force_list userid',
                hide: false,
                text: '💬 Отправить новые сообщения',
              }]],
            },
            reply_to_message_id: 'pinnedMessageId',
          },
        ],
      );
    });

    it('should send notification for own list', async () => {
      ctx.chat.id = 'userid';

      await updateListsMessages(ctx, 'userid', [], true);

      assert.deepEqual(
        reply.mock.calls[0].arguments,
        [
          'Список обновлён',
          {
            reply_markup: {
              inline_keyboard: [[{
                callback_data: 'force_own_list',
                hide: false,
                text: '💬 Отправить новые сообщения',
              }]],
            },
            reply_to_message_id: 'pinnedMessageId',
          },
        ],
      );
    });
  });
});
