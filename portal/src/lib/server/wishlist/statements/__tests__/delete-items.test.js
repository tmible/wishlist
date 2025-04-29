import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteItems } from '../../events.js';
import { initDeleteItemsStatements } from '../delete-items.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('wishlist / statements / delete items', () => {
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

  it('should subscribe to event', () => {
    initDeleteItemsStatements();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(DeleteItems, expect.any(Function));
  });

  describe('subscriber', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initDeleteItemsStatements();
    });

    it('should return if there are no ids', () => {
      expect(eventHandler('userid', [])).toEqual({ changes: 0 });
    });

    it('should inject database', () => {
      eventHandler('userid', [ 1, 2, 3 ]);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
    });

    it('should prepare statements', () => {
      eventHandler('userid', [ 1, 2, 3 ]);
      expect(
        db.prepare.mock.calls,
      ).toEqual([
        [ expect.any(String) ],
        [ expect.any(String) ],
        [ expect.any(String) ],
      ]);
    });

    it('should run statements on event emit', () => {
      eventHandler('userid', [ 1, 2, 3 ]);
      expect(
        statement.run.mock.calls,
      ).toEqual([
        [[ 1, 2, 3 ]],
        [[ 1, 2, 3 ]],
        [ 1, 2, 3, 'userid' ],
      ]);
    });
  });
});
