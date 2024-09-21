import { json } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import descriptionEntitiesReducer from '@tmible/wishlist-common/description-entities-reducer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { parseAndInsertDescriptionEntities } from '$lib/parse-and-insert-description-entities.js';
import { DELETE, GET, PATCH, POST } from '../+server.js';

vi.mock('@sveltejs/kit');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/description-entities-reducer');
vi.mock('$lib/parse-and-insert-description-entities.js');

describe('wishlist endpoint', () => {
  let locals;

  beforeEach(() => {
    locals = { userid: 'userid' };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET', () => {
    let statement;
    let reducable;
    const statementResult = [{
      categoryId: 'categoryId2',
      categoryName: 'category 2',
      order: 1,
    }, {
      categoryId: 'categoryId1',
      categoryName: 'category 2',
      order: 0,
    }];

    beforeEach(() => {
      reducable = { reduce: vi.fn(() => statementResult) };
      statement = { all: vi.fn(() => reducable) };
      vi.mocked(inject).mockReturnValue(statement);
    });

    it('should run GetUserWishlistStatement', async () => {
      await GET({ locals });
      expect(statement.all).toHaveBeenCalledWith('userid');
    });

    it('should reduce statement result', async () => {
      await GET({ locals });
      expect(reducable.reduce).toHaveBeenCalledWith(descriptionEntitiesReducer, []);
    });

    it('should map categories, sort by order and return statement result', async () => {
      vi.mocked(json).mockImplementation((value) => value);
      expect(
        await GET({ locals }),
      ).toEqual([{
        category: {
          id: 'categoryId1',
          name: 'category 2',
        },
        order: 0,
      }, {
        category: {
          id: 'categoryId2',
          name: 'category 2',
        },
        order: 1,
      }]);
    });
  });

  describe('POST', () => {
    let request;
    let db;
    let ipcConnection;

    beforeEach(() => {
      request = {
        json: vi.fn(() => ({
          name: 'name',
          description: 'description',
          descriptionEntities: JSON.stringify([]),
          order: 'order',
          categoryId: 'categoryId',
        })),
      };
      db = {
        transaction: vi.fn(() => vi.fn()),
      };
      ipcConnection = {
        sendMessage: vi.fn(),
      };
      vi.mocked(inject).mockReturnValueOnce(db).mockReturnValueOnce(ipcConnection);
    });

    it('should use database', async () => {
      await POST({ locals, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    describe('transaction', () => {
      let transaction;
      let statement;

      beforeEach(() => {
        statement = { get: vi.fn(() => ({ id: 'item id' })) };
        db.transaction = vi.fn((passedFunction) => {
          transaction = passedFunction;
          return () => {};
        });
        vi.mocked(inject).mockImplementation((token) => {
          let injected;
          switch (token) {
            case InjectionToken.Database: {
              injected = db;
              break;
            }
            case InjectionToken.AddItemStatement: {
              injected = statement;
              break;
            }
            case InjectionToken.IPCHub: {
              injected = ipcConnection;
              break;
            }
            default:
          }
          return injected;
        });
      });

      it('should run AddItemStatement', async () => {
        await POST({ locals, request });
        transaction();
        expect(
          statement.get,
        ).toHaveBeenLastCalledWith(
          'userid',
          'name',
          'description',
          'order',
          'categoryId',
        );
      });

      it('should call parseAndInsertDescriptionEntities', async () => {
        await POST({ locals, request });
        transaction();
        expect(
          vi.mocked(parseAndInsertDescriptionEntities),
        ).toHaveBeenCalledWith(
          db,
          'item id',
          [],
        );
      });
    });

    it('should use IPC connection', async () => {
      await POST({ locals, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.IPCHub);
    });

    it('should send message to IPC hub', async () => {
      await POST({ locals, request });
      expect(ipcConnection.sendMessage).toHaveBeenCalledWith('update userid');
    });

    it('should return success', async () => {
      const response = await POST({ locals, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('PATCH', () => {
    let request;
    let db;
    let statement;
    let ipcConnection;

    beforeEach(() => {
      request = { json: vi.fn(() => [{ id: 0, order: 1 }, { id: 1, order: 0 }]) };
      statement = { run: vi.fn() };
      db = { prepare: vi.fn(() => statement) };
      ipcConnection = { sendMessage: vi.fn() };
      vi.mocked(inject).mockReturnValueOnce(db).mockReturnValueOnce(ipcConnection);
    });

    it('should use database', async () => {
      await PATCH({ locals, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    it('should prepare statement', async () => {
      await PATCH({ locals, request });
      expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
    });

    it('should run prepared statement', async () => {
      await PATCH({ locals, request });
      expect(statement.run).toHaveBeenCalledWith(0, 1, 1, 0);
    });

    it('should use IPC connection', async () => {
      await PATCH({ locals, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.IPCHub);
    });

    it('should send message to IPC hub', async () => {
      await PATCH({ locals, request });
      expect(ipcConnection.sendMessage).toHaveBeenCalledWith('update userid');
    });

    it('should return success', async () => {
      const response = await PATCH({ locals, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('DELETE', () => {
    let request;
    let db;
    let statement;
    let ipcConnection;

    beforeEach(() => {
      request = { json: vi.fn(() => [ 1, 2, 3 ]) };
      statement = {
        get: vi.fn(() => ({ number: 3 })),
        run: vi.fn(),
      };
      db = {
        transaction: vi.fn((passedFunction) => passedFunction),
        prepare: vi.fn(() => statement),
      };
      ipcConnection = { sendMessage: vi.fn() };
      vi.mocked(inject).mockReturnValueOnce(db).mockReturnValueOnce(ipcConnection);
    });

    it('should use database', async () => {
      await DELETE({ locals, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
    });

    it('should prepare count statement', async () => {
      await DELETE({ locals, request });
      expect(
        db.prepare,
      ).toHaveBeenCalledWith(
        'SELECT COUNT(*) as number FROM list WHERE id IN (?, ?, ?) AND userid = ?',
      );
    });

    it('should run count statement', async () => {
      await DELETE({ locals, request });
      expect(statement.get).toHaveBeenCalledWith(1, 2, 3, 'userid');
    });

    it('should return error if count statement fails', async () => {
      statement.get.mockReturnValue(0);
      const response = await DELETE({ locals, request });
      expect(response.status).toBe(401);
      expect(response.body).toBeNull();
    });

    it('should prepare delete from description_entities statement', async () => {
      await DELETE({ locals, request });
      expect(
        db.prepare,
      ).toHaveBeenCalledWith(
        'DELETE FROM description_entities WHERE list_item_id IN (?, ?, ?)',
      );
    });

    it('should run delete from description_entities statement', async () => {
      await DELETE({ locals, request });
      expect(statement.run).toHaveBeenNthCalledWith(1, [ 1, 2, 3 ]);
    });

    it('should prepare delete from participants statement', async () => {
      await DELETE({ locals, request });
      expect(
        db.prepare,
      ).toHaveBeenCalledWith(
        'DELETE FROM participants WHERE list_item_id IN (?, ?, ?)',
      );
    });

    it('should run delete from participants statement', async () => {
      await DELETE({ locals, request });
      expect(statement.run).toHaveBeenNthCalledWith(2, [ 1, 2, 3 ]);
    });

    it('should prepare delete from list statement', async () => {
      await DELETE({ locals, request });
      expect(
        db.prepare,
      ).toHaveBeenCalledWith(
        'DELETE FROM list WHERE id IN (?, ?, ?)',
      );
    });

    it('should run delete from list statement', async () => {
      await DELETE({ locals, request });
      expect(statement.run).toHaveBeenNthCalledWith(3, [ 1, 2, 3 ]);
    });

    it('should use IPC connection', async () => {
      await DELETE({ locals, request });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.IPCHub);
    });

    it('should send message to IPC hub', async () => {
      await DELETE({ locals, request });
      expect(ipcConnection.sendMessage).toHaveBeenCalledWith('update userid');
    });

    it('should return success', async () => {
      const response = await DELETE({ locals, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });
});
