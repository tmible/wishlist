import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { AddCategory } from '../../events.js';
import { initAddCategoryStatement } from '../add-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ AddCategory: 'add category' }));

describe('categories / statements / add category', () => {
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
    initAddCategoryStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initAddCategoryStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initAddCategoryStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(AddCategory), expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initAddCategoryStatement();
    eventHandler('userid', 'name');
    expect(statement.get).toHaveBeenCalledWith('userid', 'name');
  });
});
