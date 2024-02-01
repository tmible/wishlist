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
              messagesToEditIds: [ 1, 2 ],
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
    it('should edit every message', async () => {
      const messages = [[ 'message 1' ], [ 'message 2' ]];

      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        editMessageText.mock.calls.map((call) => call.arguments),
        ctx.session.persistent.lists.userid.messagesToEditIds.map((messageToEditId, i) => [
          ctx.chat.id,
          messageToEditId,
          undefined,
          messages[i][0],
        ]),
      );
    });

    it('should delete excess messages', async () => {
      const messagesToEditIds = [ 1, 2, 3 ];
      const messages = [[ 'message 1' ], [ 'message 2' ]];
      ctx.session.persistent.lists.userid.messagesToEditIds = messagesToEditIds.slice();

      await updateListsMessages(ctx, 'userid', messages, false);

      assert.deepEqual(
        deleteMessage.mock.calls.map((call) => call.arguments),
        messagesToEditIds.slice(messages.length).map((messageToEditId) => [ messageToEditId ]),
      );
    });

    it('should not send notification if not requested', async () => {
      await updateListsMessages(ctx, 'userid', [[ 'message 1' ], [ 'message 2' ]], false);
      assert.equal(reply.mock.calls.length, 0);
    });

    describe('if notification is requested', () => {
      it('should send notification for foreign list', async () => {
        await updateListsMessages(ctx, 'userid', [[ 'message 1' ], [ 'message 2' ]]);

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

        await updateListsMessages(ctx, 'userid', [[ 'message 1' ], [ 'message 2' ]]);

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
    await updateListsMessages(ctx, 'userid', [[ 'message 1' ]]);
    assert.deepEqual(ctx.session.persistent.lists.userid.messagesToEditIds, [ 1 ]);
  });
});
