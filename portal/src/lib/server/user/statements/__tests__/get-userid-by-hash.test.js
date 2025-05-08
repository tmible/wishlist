import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetUseridByHash } from '../../events.js';
import { initGetUseridByHashStatement } from '../get-userid-by-hash.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetUseridByHash: 'get userid by hash' }));

describe('user / statements / get userid by hash', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { get: vi.fn(() => ({ userid: 'userid' })) };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initGetUseridByHashStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initGetUseridByHashStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initGetUseridByHashStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(GetUseridByHash),
      expect.any(Function),
    );
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetUseridByHashStatement();
    eventHandler('hash');
    expect(statement.get).toHaveBeenCalledWith('hash');
  });

  it('should return hash on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetUseridByHashStatement();
    expect(eventHandler('hash')).toBe('userid');
  });
});
