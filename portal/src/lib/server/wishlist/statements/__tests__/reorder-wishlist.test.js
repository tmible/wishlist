import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { ReorderWishlist } from '../../events.js';
import { initReorderWishlistStatement } from '../reorder-wishlist.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('wishlist / statements / reorder wishlist', () => {
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
    initReorderWishlistStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(ReorderWishlist, expect.any(Function));
  });

  describe('subscriber', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initReorderWishlistStatement();
    });

    it('should return if patch is empty', () => {
      expect(eventHandler('userid', [])).toEqual({ changes: 0 });
    });

    it('should inject database', () => {
      eventHandler('userid', [{ id: 'id', order: 'order' }]);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
    });

    it('should prepare statement', () => {
      eventHandler('userid', [{ id: 'id', order: 'order' }]);
      expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
    });

    it('should run statement on event emit', () => {
      eventHandler('userid', [{ id: 'id', order: 'order' }]);
      expect(statement.run).toHaveBeenCalledWith('id', 'order', 'userid');
    });
  });
});
