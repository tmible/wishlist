import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import updateListsMessages from '../update-lists-messages.js';

describe('updateListsMessages', () => {
  let ctx;
  let reply;
  let pinChatMessage;
  let editMessageText;
  let deleteMessage;

  beforeEach(() => {
    reply = mock.fn((text) => Promise.resolve(
      { message_id: 'messageId', chat: { id: 'chatId' }, text },
    ));
    pinChatMessage = mock.fn();
    editMessageText = mock.fn();
    deleteMessage = mock.fn();
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
                entities: i === 1 ?
                  [{ type: 0, offset: 0, length: 2 }] :
                  [{ type: 0, offset: 0, length: 1 }, { type: 0, offset: 1, length: 1 }],
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
    await updateListsMessages(ctx, 'userid', [], 'titleMessageText');
    assert.deepEqual(pinChatMessage.mock.calls[0].arguments, [ 'pinnedMessageId' ]);
  });

  it('should edit pinned message if there are no new messages', async () => {
    await updateListsMessages(ctx, 'userid', [], 'titleMessageText');
    await assertSnapshot(
      JSON.stringify(editMessageText.mock.calls[0].arguments),
      resolve(
        import.meta.dirname,
        '__snapshots__',
        'update-lists-messages',
        'should edit pinned message if there are no new messages.json',
      ),
    );
  });

  describe('if messages numbers are equal', () => {
    let messages;

    beforeEach(() => {
      messages = [{
        itemId: 1,
        message: [
          { text: 'message 1', entities: [{ type: 1, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 3,
        message: [
          { text: 'message 3', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 2,
        message: [
          { text: 'message 2', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 4,
        message: [
          { text: 'message 4', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 5,
        message: [
          { text: 'message 5 new', entities: [{ type: 0, offset: 0, length: 2 }] },
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
          { text: 'message 1', entities: [{ type: 1, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          2,
          undefined,
          { text: 'message 3', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          3,
          undefined,
          { text: 'message 2', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          5,
          undefined,
          { text: 'message 5 new', entities: [{ type: 0, offset: 0, length: 2 }] },
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
          entities: [{ type: 1, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 2,
          itemId: 3,
          text: 'message 3',
          entities: [{ type: 0, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 3,
          itemId: 2,
          text: 'message 2',
          entities: [{ type: 0, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 4,
          itemId: 4,
          text: 'message 4',
          entities: [{ type: 0, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 5,
          itemId: 5,
          text: 'message 5 new',
          entities: [{ type: 0, offset: 0, length: 2 }],
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
        message: [
          { text: 'message 3', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 2,
        message: [
          { text: 'message 2', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 6,
        message: [
          { text: 'message 6', entities: [{ type: 1, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ],
      }, {
        itemId: 5,
        message: [
          { text: 'message 5 new', entities: [{ type: 0, offset: 0, length: 2 }] },
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
          { text: 'message 3', entities: [{ type: 0, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          3,
          undefined,
          { text: 'message 6', entities: [{ type: 1, offset: 0, length: 2 }] },
          { reply_markup: { inline_keyboard: [] } },
        ], [
          ctx.chat.id,
          5,
          undefined,
          { text: 'message 5 new', entities: [{ type: 0, offset: 0, length: 2 }] },
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
          entities: [{ type: 0, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 2,
          itemId: 2,
          text: 'message 2',
          entities: [{ type: 0, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 3,
          itemId: 6,
          text: 'message 6',
          entities: [{ type: 1, offset: 0, length: 2 }],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 5,
          itemId: 5,
          text: 'message 5 new',
          entities: [{ type: 0, offset: 0, length: 2 }],
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
      await updateListsMessages(ctx, 'userid', [], '', true);

      assert.deepEqual(
        reply.mock.calls[0].arguments,
        [
          'Список обновлён',
          {
            reply_markup: {
              inline_keyboard: [[{
                callback_data: 'force_list userid',
                hide: false,
                text: 'Отправить новые сообщения',
              }]],
            },
            reply_to_message_id: 'pinnedMessageId',
          },
        ],
      );
    });

    it('should send notification for own list', async () => {
      ctx.chat.id = 'userid';

      await updateListsMessages(ctx, 'userid', [], '', true);

      assert.deepEqual(
        reply.mock.calls[0].arguments,
        [
          'Список обновлён',
          {
            reply_markup: {
              inline_keyboard: [[{
                callback_data: 'force_own_list',
                hide: false,
                text: 'Отправить новые сообщения',
              }]],
            },
            reply_to_message_id: 'pinnedMessageId',
          },
        ],
      );
    });
  });
});
