import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import getSessionKey from '../get-session-key.js';

describe('getSessionKey', () => {
  it('should return chat id', () => {
    const chatId = Math.floor(
      Math.random() *
        (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1) +
        Number.MIN_SAFE_INTEGER
    );
    const ctx = { chat: { id: chatId } };
    assert.equal(getSessionKey(ctx), chatId.toString());
  });
});
