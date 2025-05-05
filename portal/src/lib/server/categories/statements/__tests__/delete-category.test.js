import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteCategory } from '../../events.js';
import { initDeleteCategoryStatement } from '../delete-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ DeleteCategory: 'delete category' }));

describe('categories / statements / delete category', () => {
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

  it('should inject database', () => {
    initDeleteCategoryStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initDeleteCategoryStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initDeleteCategoryStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(DeleteCategory),
      expect.any(Function),
    );
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initDeleteCategoryStatement();
    eventHandler('userid', 'id');
    expect(statement.run).toHaveBeenCalledWith('id', 'userid');
  });
});
