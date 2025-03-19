import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import forcePrivacyModeMiddleware from '../force-privacy-mode.js';

describe('forcePrivacyModeMiddleware', () => {
  let next;

  beforeEach(() => next = mock.fn());

  afterEach(() => mock.reset());

  it(
    'should ignore messages that are not commands, not replies and don\'t mention bot',
    async () => {
      await forcePrivacyModeMiddleware(
        { updateType: 'message', message: {}, botInfo: { id: 'botId' } },
        next,
      );
      assert.equal(next.mock.calls.length, 0);
    },
  );

  it(
    'should ignore messages that are not commands, not replies and don\'t have mentions',
    async () => {
      await forcePrivacyModeMiddleware(
        {
          updateType: 'message',
          message: {},
          botInfo: { id: 'botId' },
        },
        next,
      );
      assert.equal(next.mock.calls.length, 0);
    },
  );

  it(
    'should ignore messages that are not commands, are ' +
    'replies not to bot messages and don\'t mention bot',
    async () => {
      await forcePrivacyModeMiddleware(
        {
          updateType: 'message',
          message: {
            text: '',
            entities: [{ type: 'mention', offset: 0, length: 0 }],
            reply_to_message: { from: { id: 'fromId' } },
          },
          botInfo: { id: 'botId' },
        },
        next,
      );
      assert.equal(next.mock.calls.length, 0);
    },
  );

  it('should pass non-message updates', async () => {
    await forcePrivacyModeMiddleware({ updateType: 'action', message: {} }, next);
    assert.ok(next.mock.calls.length > 0);
  });

  it('should pass messages that are commands', async () => {
    await forcePrivacyModeMiddleware(
      { updateType: 'message', message: { text: '', entities: [{ type: 'bot_command' }] } },
      next,
    );
    assert.ok(next.mock.calls.length > 0);
  });

  it('should pass messages where bot is mentioned', async () => {
    await forcePrivacyModeMiddleware(
      {
        updateType: 'message',
        message: {
          text: '@bot_username',
          entities: [{ type: 'mention', offset: 0, length: 13 }],
        },
        botInfo: { username: 'bot_username' },
      },
      next,
    );
    assert.ok(next.mock.calls.length > 0);
  });

  it('should pass messages that are replies to bot messages', async () => {
    await forcePrivacyModeMiddleware(
      {
        updateType: 'message',
        message: { reply_to_message: { from: { id: 'botId' } } },
        botInfo: { id: 'botId' },
      },
      next,
    );
    assert.ok(next.mock.calls.length > 0);
  });
});
