import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { AddItem } from '../../events.js';
import { initAddItemStatement } from '../add-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ AddItem: 'add item' }));

describe('wishlist / statements / add item', () => {
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
    initAddItemStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initAddItemStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initAddItemStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(AddItem), expect.any(Function));
  });

  describe('on event emit', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initAddItemStatement();
    });

    it('should run statement without addedBy', () => {
      eventHandler(
        'userid',
        {
          name: 'name',
          description: 'description',
          order: 'order',
          categoryId: 'category id',
        },
      );
      expect(
        statement.get,
      ).toHaveBeenCalledWith(
        'userid',
        'name',
        'description',
        'order',
        'category id',
        null,
      );
    });

    it('should run statement with addedBy', () => {
      eventHandler(
        'userid',
        {
          name: 'name',
          description: 'description',
          order: 'order',
          categoryId: 'category id',
          addedBy: 'added by',
        },
      );
      expect(
        statement.get,
      ).toHaveBeenCalledWith(
        'userid',
        'name',
        'description',
        'order',
        'category id',
        'added by',
      );
    });
  });
});
