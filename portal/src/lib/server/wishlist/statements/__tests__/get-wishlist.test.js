import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetWishlist } from '../../events.js';
import { initGetWishlistStatement } from '../get-wishlist.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/description-entities-reducer');
vi.mock('@tmible/wishlist-common/event-bus');

describe('wishlist / statements / get wishlist', () => {
  let db;
  let statement;

  beforeEach(() => {
    statement = { all: vi.fn().mockReturnValue([]) };
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initGetWishlistStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('should prepare statement', () => {
    initGetWishlistStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initGetWishlistStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(GetWishlist, expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetWishlistStatement();
    eventHandler('userid');
    expect(statement.all).toHaveBeenCalledWith('userid');
  });

  it('should reduce description entities', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    statement.all.mockReturnValueOnce([ 'item' ]);
    vi.mocked(descriptionEntitiesReducer).mockReturnValueOnce([]);
    initGetWishlistStatement();
    eventHandler();
    expect(vi.mocked(descriptionEntitiesReducer)).toHaveBeenCalledWith([], 'item', 0, [ 'item' ]);
  });

  it('should return wishlist sorted and with wrapped up categories', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    statement.all.mockReturnValueOnce([ 'item', 'item' ]);
    vi.mocked(descriptionEntitiesReducer)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([{
        categoryId: 2,
        categoryName: 'name 2',
        other: 'property 2',
        order: 2,
      }, {
        categoryId: 1,
        categoryName: 'name 1',
        other: 'property 1',
        order: 1,
      }]);
    initGetWishlistStatement();
    expect(
      eventHandler(),
    ).toEqual([{
      category: {
        id: 1,
        name: 'name 1',
      },
      other: 'property 1',
      order: 1,
    }, {
      category: {
        id: 2,
        name: 'name 2',
      },
      other: 'property 2',
      order: 2,
    }]);
  });
});
