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
              messagesToEdit: [
                { id: 1, text: 'message 1', entities: [], reply_markup: { inline_keyboard: [] } },
                { id: 2, text: 'message 2', entities: [], reply_markup: { inline_keyboard: [] } },
              ],
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

  describe('editing messages', () => {
    it('should edit only changed messages', async () => {
      const messages = [
        [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
        [{ text: 'message 2 new', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      ];

      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        editMessageText.mock.calls.map((call) => call.arguments),
        [[
          ctx.chat.id,
          2,
          undefined,
          { text: 'message 2 new', entities: [] },
          { reply_markup: { inline_keyboard: [] } },
        ]],
      );
    });

    it('should save changed messages in session', async () => {
      const messages = [
        [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
        [{ text: 'message 2 new', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      ];

      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        ctx.session.persistent.lists.userid.messagesToEdit,
        [{
          id: 1,
          text: 'message 1',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }, {
          id: 2,
          text: 'message 2 new',
          entities: [],
          reply_markup: { inline_keyboard: [] },
        }],
      );
    });

    it('should delete excess messages', async () => {
      const messages = [
        [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
        [{ text: 'message 2', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
      ];
      ctx.session.persistent.lists.userid.messagesToEdit.push({
        id: 3,
        text: 'message 3',
        entities: [],
        reply_markup: { inline_keyboard: [] },
      });

      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(deleteMessage.mock.calls.map((call) => call.arguments), [[ 3 ]]);
    });

    it('should not send notification if not requested', async () => {
      await updateListsMessages(
        ctx,
        'userid',
        [
          [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
          [{ text: 'message 2', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
        ],
        false,
      );
      assert.equal(reply.mock.calls.length, 0);
    });

    describe('if notification is requested', () => {
      it('should send notification for foreign list', async () => {
        await updateListsMessages(
          ctx,
          'userid',
          [
            [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
            [{ text: 'message 2', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
          ],
          true,
        );

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

        await updateListsMessages(
          ctx,
          'userid',
          [
            [{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
            [{ text: 'message 2', entities: [] }, { reply_markup: { inline_keyboard: [] } }],
          ],
          true,
        );

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

  it('should slice old messages list', async () => {
    await updateListsMessages(
      ctx,
      'userid',
      [[{ text: 'message 1', entities: [] }, { reply_markup: { inline_keyboard: [] } } ]],
      false,
    );
    assert.deepEqual(
      ctx.session.persistent.lists.userid.messagesToEdit,
      [{ id: 1, text: 'message 1', entities: [], reply_markup: { inline_keyboard: [] } }],
    );
  });
});
