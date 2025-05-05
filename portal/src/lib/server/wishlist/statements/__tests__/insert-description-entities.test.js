import DescriptionEntityBaseKeys from '@tmible/wishlist-common/constants/description-entity-base-keys';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '$lib/server/db/injection-tokens.js';
import { InsertDescriptionEntities } from '../../events.js';
import { initInsertDescriptionEntitiesStatement } from '../insert-description-entities.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/injection-tokens.js', () => ({ Database: 'database' }));
vi.mock('../../events.js', () => ({ InsertDescriptionEntities: 'insert description entities' }));

describe('wishlist / statements / insert description entities', () => {
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
    initInsertDescriptionEntitiesStatement();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(InsertDescriptionEntities),
      expect.any(Function),
    );
  });

  describe('subscriber if there are entities', () => {
    const baseDescriptionEntity = Object.fromEntries(
      Array.from(DescriptionEntityBaseKeys, (key) => [ key, key ]),
    );

    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementationOnce((event, handler) => eventHandler = handler);
      initInsertDescriptionEntitiesStatement();
    });

    it('should inject database', () => {
      eventHandler('userid', [ 1, 2, 3 ]);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Database));
    });

    it('should prepare statement', () => {
      eventHandler(
        'id',
        [
          { ...baseDescriptionEntity, any: 'other' },
          baseDescriptionEntity,
        ],
      );
      expect(db.prepare.mock.calls[0]).toMatchSnapshot();
    });

    it('should run statement on event emit', () => {
      eventHandler(
        'id',
        [
          { ...baseDescriptionEntity, any: 'other' },
          baseDescriptionEntity,
        ],
      );
      expect(statement.run.mock.calls[0]).toMatchSnapshot();
    });
  });
});
