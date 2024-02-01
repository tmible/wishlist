import { strict as assert } from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import {
  removeLastMarkupMiddleware,
  sendMessageAndMarkItForMarkupRemove,
} from '../remove-markup.js';

describe('removeLastMarkupMiddleware', () => {
  describe('if there is no marked message in session', () => {
    let ctx;

    beforeEach(() => ctx = { session: { persistent: {} } });

    it('should pass', async (testContext) => {
      const next = testContext.mock.fn(async () => {});
      await removeLastMarkupMiddleware(ctx, next);
      assert(next.mock.calls.length > 0);
    });

    it('should not remove reply markup', async (testContext) => {
      const editMessageReplyMarkup = testContext.mock.fn(async () => {});
      ctx.telegram = { editMessageReplyMarkup };
      await removeLastMarkupMiddleware(ctx, async () => {});
      assert.equal(editMessageReplyMarkup.mock.calls.length, 0);
    });
  });

  describe('if there is marked message', () => {
    let ctx;

    beforeEach(() => ctx = {
      telegram: {
        editMessageReplyMarkup: async () => {},
      },
      session: {
        persistent: {
          messageForMarkupRemove: {
            chatId: 'chatId',
            id: 'id',
          },
        },
      },
    });

    it('should pass', async (testContext) => {
      const next = testContext.mock.fn(async () => {});
      await removeLastMarkupMiddleware(ctx, next);
      assert(next.mock.calls.length > 0);
    });

    it('should edit marked message reply markup', async (testContext) => {
      const editMessageReplyMarkup = testContext.mock.fn(async () => {});
      ctx.telegram = { editMessageReplyMarkup };
      await removeLastMarkupMiddleware(ctx, async () => {});
      assert.deepEqual(editMessageReplyMarkup.mock.calls[0].arguments, [ 'chatId', 'id' ]);
    });

    it('should delete marked message from session', async () => {
      await removeLastMarkupMiddleware(ctx, async () => {});
      assert.equal(ctx.session.persistent.messageForMarkupRemove, undefined);
    });
  });
});

describe('sendMessageAndMarkItForMarkupRemove', () => {
  it('should send message', async () => {
    const reply = mock.fn(
      () => new Promise((resolve) => resolve({ message_id: 'id', chat: { id: 'chatId' } })),
    );
    await sendMessageAndMarkItForMarkupRemove(
      { reply, session: { persistent: {} } },
      'reply',
      'message',
    );
    assert.deepEqual(reply.mock.calls[0].arguments, [ 'message' ]);
  });

  it('should mark message in session', async () => {
    const ctx = {
      reply: () => new Promise(
        (resolve) => resolve({ message_id: 'id', chat: { id: 'chatId' } }),
      ),
      session: { persistent: {} },
    };
    await sendMessageAndMarkItForMarkupRemove(ctx, 'reply', 'message');
    assert.deepEqual(ctx.session.persistent.messageForMarkupRemove, { id: 'id', chatId: 'chatId' });
  });
});
