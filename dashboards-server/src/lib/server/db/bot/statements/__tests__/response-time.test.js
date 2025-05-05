import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../../injection-tokens.js';
import { GetResponseTime } from '../../events.js';
import { initResponseTimeStatement } from '../response-time.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../../injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetResponseTime: 'get response time' }));

describe('bot response time statement', () => {
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
    initResponseTimeStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initResponseTimeStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initResponseTimeStatement();
    expect(

      vi.mocked(subscribe),

    ).toHaveBeenCalledWith(

      vi.mocked(GetResponseTime),

      expect.any(Function),

    );
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initResponseTimeStatement();
    eventHandler('start');
    expect(statement.all).toHaveBeenCalledWith('start');
  });
});
