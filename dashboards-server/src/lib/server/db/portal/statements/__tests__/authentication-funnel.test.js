import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../../injection-tokens.js';
import { GetAuthenticationFunnel } from '../../events.js';
import { initAuthenticationFunnelStatement } from '../authentication-funnel.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../../injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetAuthenticationFunnel: 'get authentication funnel' }));

describe('portal authentication funnel statement', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { get: vi.fn() };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initAuthenticationFunnelStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initAuthenticationFunnelStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should provide statement', () => {
    initAuthenticationFunnelStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(GetAuthenticationFunnel),
      expect.any(Function),
    );
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initAuthenticationFunnelStatement();
    eventHandler('start');
    expect(statement.get).toHaveBeenCalledWith({ periodStart: 'start' });
  });
});
