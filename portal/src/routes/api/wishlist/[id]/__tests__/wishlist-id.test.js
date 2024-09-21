import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { parseAndInsertDescriptionEntities } from '$lib/parse-and-insert-description-entities.js';
import { PATCH } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('$lib/parse-and-insert-description-entities.js');

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
      const response = await PATCH({ params, request });
      expect(response.status).toBe(400);
      expect(response.body).toBeNull();
    });

    it('should not use databse', async () => {
      await PATCH({ params, request });
      expect(vi.mocked(inject)).not.toHaveBeenCalledWith(InjectionToken.Database);
    });
  });

  describe('if there are keys to update', () => {
    let db;
    let ipcConnection;

    beforeEach(() => {
      request = { json: vi.fn(() => ({
        name: 'name',
        categoryId: 'categoryId',
        userid: 'userid',
      })) };
      db = {
        transaction: vi.fn(() => vi.fn()),
      };
      ipcConnection = {
        sendMessage: vi.fn(),
      };
      vi.mocked(inject).mockReturnValueOnce(db).mockReturnValueOnce(ipcConnection);
    });

    it('should use database', async () => {
      await PATCH({ params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    describe('transaction', () => {
      let transaction;
      let statement;

      beforeEach(() => {
        statement = { run: vi.fn() };
        db.transaction = vi.fn((passedFunction) => {
          transaction = passedFunction;
          return () => {};
        });
        db.prepare = vi.fn(() => statement);
      });

      it('should prepare update statement', async () => {
        await PATCH({ params, request });
        transaction();
        expect(
          db.prepare,
        ).toHaveBeenLastCalledWith(
          'UPDATE list SET name = name, category_id = categoryId WHERE id = ?',
        );
      });

      it('should run update statement', async () => {
        await PATCH({ params, request });
        transaction();
        expect(statement.run).toHaveBeenLastCalledWith('id');
      });

      it('should return if there is no description in request body', async () => {
        await PATCH({ params, request });
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
          await PATCH({ params, request });
          transaction();
          expect(
            db.prepare,
          ).toHaveBeenLastCalledWith(
            'DELETE FROM description_entities WHERE list_item_id = ?',
          );
        });

        it('should run delete statement', async () => {
          await PATCH({ params, request });
          transaction();
          expect(statement.run).toHaveBeenLastCalledWith('id');
        });

        it('should call parseAndInsertDescriptionEntities', async () => {
          await PATCH({ params, request });
          transaction();
          expect(vi.mocked(parseAndInsertDescriptionEntities)).toHaveBeenCalledWith(db, 'id', []);
        });
      });
    });

    it('should use IPC connection', async () => {
      await PATCH({ params, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.IPCHub);
    });

    it('should send message to IPC hub', async () => {
      await PATCH({ params, request });
      expect(ipcConnection.sendMessage).toHaveBeenCalledWith('update userid');
    });

    it('should return success', async () => {
      const response = await PATCH({ params, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });
});
