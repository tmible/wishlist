import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../../injection-tokens.js';
import { GetMAU } from '../../events.js';
import { initMAUStatement } from '../mau.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../../injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetMAU: 'get MAU' }));

describe('bot MAU statement', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { all: vi.fn() };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initMAUStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initMAUStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initMAUStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(GetMAU), expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initMAUStatement();
    eventHandler('start', 'end');
    expect(statement.all).toHaveBeenCalledWith({ periodStart: 'start', periodEnd: 'end' });
  });
});
