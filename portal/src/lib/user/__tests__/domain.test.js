import { describe, expect, it } from 'vitest';
import { DEFAULT_USER } from '../default-user.const.js';
import { createUser, loginUser, logoutUser, setUserHash } from '../domain.js';

describe('user / domain', () => {
  it('should create user', () => {
    expect(
      createUser({ initial: 'data', hash: 'hash' }),
    ).toEqual({
      ...DEFAULT_USER,
      initial: 'data',
      hash: 'hash',
    });
  });

  it('should login user', () => {
    expect(loginUser({}, 'userid')).toEqual({ isAuthenticated: true, id: 'userid' });
  });

  it('should logout user', () => {
    expect(logoutUser({})).toEqual({ isAuthenticated: false, id: null, hash: null });
  });

  it('should set user hash', () => {
    expect(setUserHash({}, 'hash')).toEqual({ hash: 'hash' });
  });
});
