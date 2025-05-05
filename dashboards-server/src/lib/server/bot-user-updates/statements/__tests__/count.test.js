import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { CountBotUserUpdates } from '../../events.js';
import { filtersToString } from '../../filters-to-string.js';
import { initCountBotUserUpdatesStatement } from '../count.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ CountBotUserUpdates: 'count bot user updates' }));
vi.mock('../../filters-to-string.js');

describe('bot user updates / statements / count', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { get: vi.fn().mockReturnValue({ total: 'total' }) };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to event', () => {
    initCountBotUserUpdatesStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(CountBotUserUpdates),
      expect.any(Function),
    );
  });

  describe('subscriber', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initCountBotUserUpdatesStatement();
    });

    it('should inject database', () => {
      eventHandler('timeLock', 'filters');
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
    });

    it('should prepare statement', () => {
      vi.mocked(filtersToString).mockReturnValueOnce('filters string');
      eventHandler('timeLock', 'filters');
      expect(db.prepare.mock.calls[0]).toMatchSnapshot();
    });

    it('should run statement on event emit', () => {
      eventHandler('timeLock', 'filters');
      expect(statement.get).toHaveBeenCalledWith('timeLock');
    });

    it('should return statement run result on event emit', () => {
      expect(eventHandler('timeLock', 'filters')).toBe('total');
    });
  });
});
