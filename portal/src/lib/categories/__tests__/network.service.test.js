import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../network.service.js';

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({ ok: 'ok' }),
);

describe('categories / network service', () => {
  describe('getCategories', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: 'ok', json: vi.fn().mockResolvedValue('json') });
    });

    it('should fetch categories', async () => {
      await getCategories();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist/categories');
    });

    it('should return categories and response status', async () => {
      await expect(getCategories()).resolves.toEqual([ 'json', 'ok' ]);
    });
  });

  describe('createCategory', () => {
    it('should fetch creation', async () => {
      const id = Math.round(Math.random() * 100);
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: 'ok',
        headers: new Headers({ Location: `/${id}` }),
      });
      await createCategory({ name: 'name' });
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist/categories',
        { method: 'POST', body: 'name' },
      );
    });

    it('should throw error if there is no Location header in response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: 'ok', headers: new Headers({}) });
      await expect(
        createCategory({ name: 'name' }),
      ).rejects.toThrowError(
        'Server did not return id of created category',
      );
    });

    it('should throw error if there is no id in Location header', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: 'ok',
        headers: new Headers({ Location: 'location' }),
      });
      await expect(
        createCategory({ name: 'name' }),
      ).rejects.toThrowError(
        'Server did not return id of created category',
      );
    });

    it('should return id and response status', async () => {
      const id = Math.round(Math.random() * 100);
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: 'ok',
        headers: new Headers({ Location: `/${id}` }),
      });
      await expect(createCategory({ name: 'name' })).resolves.toEqual([ id, 'ok' ]);
    });
  });

  describe('updateCategory', () => {
    it('should fetch update', async () => {
      await updateCategory({ id: 'id', name: 'name' });
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist/categories/id',
        { method: 'PUT', body: 'name' },
      );
    });

    it('should return undefined and response status', async () => {
      await expect(
        updateCategory({ id: 'id', name: 'name' }),
      ).resolves.toEqual(
        [ undefined, 'ok' ],
      );
    });
  });

  describe('deleteCategory', () => {
    it('should fetch deletion', async () => {
      await deleteCategory({ id: 'id' });
      expect(
        vi.mocked(fetch),
      ).toHaveBeenCalledWith(
        '/api/wishlist/categories/id',
        { method: 'DELETE' },
      );
    });

    it('should return undefined and response status', async () => {
      await expect(deleteCategory({ id: 'id' })).resolves.toEqual([ undefined, 'ok' ]);
    });
  });
});
