import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import forcePrivacyModeMiddleware from '../force-privacy-mode.js';

describe('forcePrivacyModeMiddleware', () => {
  let next;

  beforeEach(() => next = mock.fn(async () => {}));

  afterEach(() => mock.reset());

  it('should ignore messages that are not commands and are not replies', async () => {
    await forcePrivacyModeMiddleware(
      { updateType: 'message', message: {}, botInfo: { id: 'botId' } },
      next,
    );
    assert.equal(next.mock.calls.length, 0);
  });

  it(
    'should ignore messages that are not commands and are replies not to bot messages',
    async () => {
      await forcePrivacyModeMiddleware(
        {
          updateType: 'message',
          message: { reply_to_message: { from: { id: 'fromId' } } },
          botInfo: { id: 'botId' },
        },
        next,
      );
      assert.equal(next.mock.calls.length, 0);
    },
  );

  it('should pass non-message updates', async () => {
    await forcePrivacyModeMiddleware({ updateType: 'action' }, next);
    assert(next.mock.calls.length > 0);
  });

  it('should pass messages that are commands', async () => {
    await forcePrivacyModeMiddleware(
      { updateType: 'message', message: { entities: [{ type: 'bot_command' }] } },
      next,
    );
    assert(next.mock.calls.length > 0);
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
    assert(next.mock.calls.length > 0);
  });
});
