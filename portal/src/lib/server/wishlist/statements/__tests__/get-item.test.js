import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetItem } from '../../events.js';
import { initGetItemStatement } from '../get-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/description-entities-reducer');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ GetItem: 'get item' }));

describe('wishlist / statements / get item', () => {
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
    initGetItemStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initGetItemStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initGetItemStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(GetItem), expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetItemStatement();
    eventHandler('id');
    expect(statement.all).toHaveBeenCalledWith('id');
  });

  it('should reduce description entities', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    statement.all.mockReturnValueOnce([ 'item' ]);
    vi.mocked(descriptionEntitiesReducer).mockReturnValueOnce([]);
    initGetItemStatement();
    eventHandler();
    expect(vi.mocked(descriptionEntitiesReducer)).toHaveBeenCalledWith([], 'item', 0, [ 'item' ]);
  });

  it('should wrap up categories', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    statement.all.mockReturnValueOnce([ 'item' ]);
    vi.mocked(descriptionEntitiesReducer).mockReturnValueOnce([{
      categoryId: 1,
      categoryName: 'name',
      other: 'property',
    }]);
    initGetItemStatement();
    expect(eventHandler()).toEqual({ category: { id: 1, name: 'name' }, other: 'property' });
  });
});
