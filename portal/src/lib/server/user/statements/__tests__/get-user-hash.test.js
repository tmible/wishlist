import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetUserHash } from '../../events.js';
import { initGetUserHashStatement } from '../get-user-hash.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetUserHash: 'get user hash' }));

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
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initGetUserHashStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initGetUserHashStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(GetUserHash), expect.any(Function));
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
