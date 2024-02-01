import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import isUserInChat from '../is-user-in-chat.js';

describe('isUserInChat', () => {
  it('should return false if userid is undefined', async () => {
    assert(!(await isUserInChat()));
  });

  it('should return false if chat isn\'t group', async () => {
    assert(!(await isUserInChat({ chat: { type: 'private' } }, '123')));
  });

  it('should return false if user never was chat member', async (testContext) => {
    const getChatMember = testContext.mock.fn(async () => {});
    assert(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return false if user left chat', async (testContext) => {
    const getChatMember = testContext.mock.fn(async () => ({ status: 'left' }));
    assert(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return false if user was kicked from chat', async (testContext) => {
    const getChatMember = testContext.mock.fn(async () => ({ status: 'kicked' }));
    assert(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return false if user is restricted and is not chat member', async (testContext) => {
    const getChatMember = testContext.mock.fn(
      async () => ({ status: 'restricted', is_member: false }),
    );
    assert(!(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123')));
  });

  it('should return true if user is not restricted', async (testContext) => {
    const getChatMember = testContext.mock.fn(async () => ({ status: 'member' }));
    assert(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123'));
  });

  it('should return true if user is restricted and is chat member', async (testContext) => {
    const getChatMember = testContext.mock.fn(
      async () => ({ status: 'restricted', is_member: true }),
    );
    assert(await isUserInChat({ chat: { type: 'group' }, getChatMember }, '123'));
  });
});
