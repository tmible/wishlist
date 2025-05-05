import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetBotUserUpdates } from '../../events.js';
import { filtersToString } from '../../filters-to-string.js';
import { initGetBotUserUpdatesStatement } from '../get.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetBotUserUpdates: 'get bot user updates' }));
vi.mock('../../filters-to-string.js');

describe('bot user updates / statements / get', () => {
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

  it('should subscribe to event', () => {
    initGetBotUserUpdatesStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(GetBotUserUpdates),
      expect.any(Function),
    );
  });

  describe('subscriber', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initGetBotUserUpdatesStatement();
    });

    it('should inject database', () => {
      eventHandler('timeLock', 'page', 'filters');
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
    });

    it('should prepare statement', () => {
      vi.mocked(filtersToString).mockReturnValueOnce('filters string');
      eventHandler('timeLock', 'page', 'filters');
      expect(db.prepare.mock.calls[0]).toMatchSnapshot();
    });

    it('should run statement on event emit', () => {
      eventHandler('timeLock', 'page', 'filters');
      expect(statement.all).toHaveBeenCalledWith('timeLock', 'page');
    });
  });
});
