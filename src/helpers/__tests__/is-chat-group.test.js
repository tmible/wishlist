import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import isChatGroup from '../is-chat-group.js';

describe('isChatGroup', () => {
  it('should return true for groups', () => {
    assert(isChatGroup({ chat: { type: 'group' } }));
  });

  it('should return true for supergroups', () => {
    assert(isChatGroup({ chat: { type: 'supergroup' } }));
  });

  it('should return false for private chats', () => {
    assert(!isChatGroup({ chat: { type: 'private' } }));
  });
});
