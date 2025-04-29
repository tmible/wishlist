import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { UpdateItem } from '../../events.js';
import { initUpdateItemStatement } from '../update-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

describe('wishlist / statements / update item', () => {
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
    initUpdateItemStatement();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(UpdateItem, expect.any(Function));
  });

  describe('subscriber', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initUpdateItemStatement();
    });

    it('should return if patch is empty', () => {
      expect(eventHandler('userid', 'id', [ 'descriptionEntities' ], {})).toEqual({ changes: 0 });
    });

    it('should inject database', () => {
      eventHandler('userid', 'id', [ 'name', 'description' ], { name: 'name', description: null });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
    });

    it('should prepare statement', () => {
      eventHandler('userid', 'id', [ 'name', 'description' ], { name: 'name', description: null });
      expect(db.prepare.mock.calls[0]).toMatchSnapshot();
    });

    it('should run statement on event emit', () => {
      eventHandler('userid', 'id', [ 'name', 'description' ], { name: 'name', description: null });
      expect(statement.run).toHaveBeenCalledWith('id', 'userid');
    });
  });
});
