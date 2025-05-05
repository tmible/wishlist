import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../../injection-tokens.js';
import { GetSuccessRate } from '../../events.js';
import { initSuccessRateStatement } from '../success-rate.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../../injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetSuccessRate: 'get success rate' }));

describe('bot success rate statement', () => {
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
    initSuccessRateStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initSuccessRateStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initSuccessRateStatement();
    expect(

      vi.mocked(subscribe),

    ).toHaveBeenCalledWith(

      vi.mocked(GetSuccessRate),

      expect.any(Function),

    );
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initSuccessRateStatement();
    eventHandler('start');
    expect(statement.get).toHaveBeenCalledWith({ periodStart: 'start' });
  });
});
