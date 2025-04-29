import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetCategories } from '../../events.js';
import { initGetCategoriesStatement } from '../get-categories.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('categories / statements / get categories', () => {
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
    initGetCategoriesStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('should prepare statement', () => {
    initGetCategoriesStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initGetCategoriesStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(GetCategories, expect.any(Function));
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initGetCategoriesStatement();
    eventHandler('userid');
    expect(statement.all).toHaveBeenCalledWith('userid');
  });
});
