import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addItem,
  deleteItem,
  deleteItems,
  getList,
  patchItem,
  reorderList,
} from '../network.service.js';

describe('wishlist / network service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getList', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: 'ok',
          json: vi.fn().mockResolvedValueOnce('wishlist'),
        }),
      );
    });

    it('should fetch list', async () => {
      await getList();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist');
    });

    it('should return list and response status', async () => {
      await expect(getList()).resolves.toEqual([ 'wishlist', 'ok' ]);
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: 'ok',
          json: vi.fn().mockResolvedValueOnce('added item'),
        }),
      );
    });

    it('should fetch item creation without target user hash', async () => {
      await addItem({ descriptionEntities: [], category: { id: 1 }, name: 'name' });
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist',
        {
          method: 'POST',
          body: JSON.stringify({ descriptionEntities: [], name: 'name', categoryId: 1 }),
        },
      );
    });

    it('should fetch item creation with target user hash', async () => {
      await addItem(
        { descriptionEntities: [], category: { id: 1 }, name: 'name' },
        'target user hash',
      );
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist?wishlist=target user hash',
        {
          method: 'POST',
          body: JSON.stringify({ descriptionEntities: [], name: 'name', categoryId: 1 }),
        },
      );
    });

    it('should return created item and response status', async () => {
      await expect(addItem({})).resolves.toEqual([ 'added item', 'ok' ]);
    });
  });

  describe('patchItem', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: 'ok' }));
    });

    it('should fetch item update', async () => {
      await patchItem({ id: 'id' }, { descriptionEntities: [], category: { id: 1 }, name: 'name' });
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist/id',
        {
          method: 'PATCH',
          body: JSON.stringify({ descriptionEntities: [], name: 'name', categoryId: 1 }),
        },
      );
    });

    it('should return response status', async () => {
      await expect(patchItem({ id: 'id' }, {})).resolves.toEqual([ undefined, 'ok' ]);
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: 'ok' }));
    });

    it('should fetch item deletion', async () => {
      await deleteItem({ id: 'id' });
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist/id', { method: 'DELETE' });
    });

    it('should return response status', async () => {
      await expect(deleteItem({ id: 'id' })).resolves.toEqual([ undefined, 'ok' ]);
    });
  });

  describe('deleteItems', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: 'ok' }));
    });

    it('should fetch items deletion', async () => {
      await deleteItems([ 1, 2, 3 ]);
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist',
        { method: 'DELETE', body: '[1,2,3]' },
      );
    });

    it('should return response status', async () => {
      await expect(deleteItems([])).resolves.toEqual([ undefined, 'ok' ]);
    });
  });

  describe('reorderList', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: 'ok' }));
    });

    it('should fetch list reorder', async () => {
      await reorderList({ patch: true });
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist',
        { method: 'PATCH', body: JSON.stringify({ patch: true }) },
      );
    });

    it('should return response status', async () => {
      await expect(reorderList({})).resolves.toEqual([ undefined, 'ok' ]);
    });
  });
});
