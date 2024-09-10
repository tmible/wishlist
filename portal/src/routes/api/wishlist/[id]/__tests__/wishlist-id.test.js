import { inject } from '@tmible/wishlist-common/dependency-injector';
import parseAndInsertDescriptionEntities from '@tmible/wishlist-common/parse-and-insert-description-entities';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { PUT } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/parse-and-insert-description-entities');

describe('wishlist/[id] endpoint', () => {
  let params;
  let request;

  beforeEach(() => {
    params = { id: 'id' };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('if there are no keys to update', () => {
    beforeEach(() => {
      request = { json: vi.fn(() => ({})) };
    });

    it('should return error', async () => {
      const response = await PUT({ params, request });
      expect(response.status).toBe(400);
      expect(response.body).toBeNull();
    });

    it('should not use databse', async () => {
      await PUT({ params, request });
      expect(vi.mocked(inject)).not.toHaveBeenCalledWith(InjectionToken.Database);
    });
  });

  describe('if there are keys to update', () => {
    let db;

    beforeEach(() => {
      request = { json: vi.fn(() => ({ name: 'name' })) };
      db = {
        transaction: vi.fn(() => vi.fn()),
      };
      vi.mocked(inject).mockReturnValue(db);
    });

    it('should use database', async () => {
      await PUT({ params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    describe('transaction', () => {
      let transaction;
      let statement;

      beforeEach(() => {
        statement = { run: vi.fn() };
        db = {
          transaction: vi.fn((passedFunction) => {
            transaction = passedFunction;
            return () => {};
          }),
          prepare: vi.fn(() => statement),
        };
        vi.mocked(inject).mockReturnValue(db);
      });

      it('should prepare update statement', async () => {
        await PUT({ params, request });
        transaction();
        expect(db.prepare).toHaveBeenLastCalledWith('UPDATE list SET name = \'name\' WHERE id = ?');
      });

      it('should run update statement', async () => {
        await PUT({ params, request });
        transaction();
        expect(statement.run).toHaveBeenLastCalledWith('id');
      });

      it('should return if there is no description in request body', async () => {
        await PUT({ params, request });
        transaction();
        expect(db.prepare).toHaveBeenCalledTimes(1);
        expect(statement.run).toHaveBeenCalledTimes(1);
      });

      describe('if there is description in request body', () => {
        beforeEach(() => {
          request = {
            json: vi.fn(() => ({
              description: 'description',
              descriptionEntities: JSON.stringify([]),
            })),
          };
        });

        it('should prepare delete statement', async () => {
          await PUT({ params, request });
          transaction();
          expect(
            db.prepare,
          ).toHaveBeenLastCalledWith(
            'DELETE FROM description_entities WHERE list_item_id = ?',
          );
        });

        it('should run delete statement', async () => {
          await PUT({ params, request });
          transaction();
          expect(statement.run).toHaveBeenLastCalledWith('id');
        });

        it('should call parseAndInsertDescriptionEntities', async () => {
          await PUT({ params, request });
          transaction();
          expect(vi.mocked(parseAndInsertDescriptionEntities)).toHaveBeenCalledWith(db, 'id', []);
        });
      });
    });

    it('should return success', async () => {
      const response = await PUT({ params, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });
});
