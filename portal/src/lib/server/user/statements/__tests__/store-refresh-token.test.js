import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { StoreRefreshToken } from '../../events.js';
import { initStoreRefreshTokenStatement } from '../store-refresh-token.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('user / statements / store refresh token', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { run: vi.fn() };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initStoreRefreshTokenStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('should prepare statement', () => {
    initStoreRefreshTokenStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initStoreRefreshTokenStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(StoreRefreshToken, expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initStoreRefreshTokenStatement();
    eventHandler('token', 'expires', 'userid', 'unknownUserUuid');
    expect(
      statement.run,
    ).toHaveBeenCalledWith({
      token: 'token',
      expires: 'expires',
      userid: 'userid',
      unknownUserUuid: 'unknownUserUuid',
    });
  });
});
