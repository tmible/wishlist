import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { UpdateCategory } from '../../events.js';
import { initUpdateCategoryStatement } from '../update-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ UpdateCategory: 'update category' }));

describe('categories / statements / update category', () => {
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
    initUpdateCategoryStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
  });

  it('should prepare statement', () => {
    initUpdateCategoryStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should subscribe to event', () => {
    initUpdateCategoryStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(UpdateCategory),
      expect.any(Function),
    );
  });

  it('should run statement on event emit', () => {
    let eventHandler;
    vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
    initUpdateCategoryStatement();
    eventHandler('userid', { id: 'id', name: 'name' });
    expect(statement.run).toHaveBeenCalledWith('name', 'id', 'userid');
  });
});
