import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import isUserInChat from '../is-user-in-chat.js';

describe('isUserInChat', () => {
  it('should return false if userid is undefined', async () => {
    assert.ok(!(await isUserInChat()));
  });

  it('should return false if chat isn\'t group', async () => {
    assert.ok(!(await isUserInChat({ chat: { type: 'private' } }, '123')));
  });

  it('should return false if user never was chat member', async (testContext) => {
    const getChatMember = testContext.mock.fn();
    assert.ok(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return false if user left chat', async (testContext) => {
    const getChatMember = testContext.mock.fn(() => ({ status: 'left' }));
    assert.ok(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return false if user was kicked from chat', async (testContext) => {
    const getChatMember = testContext.mock.fn(() => ({ status: 'kicked' }));
    assert.ok(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return false if user is restricted and is not chat member', async (testContext) => {
    const getChatMember = testContext.mock.fn(() => ({ status: 'restricted', is_member: false }));
    assert.ok(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return true if user is not restricted', async (testContext) => {
    const getChatMember = testContext.mock.fn(() => ({ status: 'member' }));
    assert.ok(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123'));
  });

  it('should return true if user is restricted and is chat member', async (testContext) => {
    const getChatMember = testContext.mock.fn(() => ({ status: 'restricted', is_member: true }));
    assert.ok(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123'));
  });
});
