import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetUserHash } from '../../events.js';
import { initGetUserHashStatement } from '../get-user-hash.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('user / statements / get user hash', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { get: vi.fn(() => ({ hash: 'hash' })) };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initGetUserHashStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('should prepare statement', () => {
    initGetUserHashStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initGetUserHashStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(GetUserHash, expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetUserHashStatement();
    eventHandler('userid');
    expect(statement.get).toHaveBeenCalledWith('userid');
  });

  it('should return hash on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetUserHashStatement();
    expect(eventHandler('userid')).toBe('hash');
  });
});
