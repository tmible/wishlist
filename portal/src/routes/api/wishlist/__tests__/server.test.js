import { json } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { protectedEndpoint } from '$lib/server/protected-endpoint.js';
import { addItem } from '$lib/server/wishlist/use-cases/add-item.js';
import { addItemExternally } from '$lib/server/wishlist/use-cases/add-item-externally.js';
import { deleteItems } from '$lib/server/wishlist/use-cases/delete-items.js';
import { getWishlist } from '$lib/server/wishlist/use-cases/get-wishlist.js';
import { reorderWishlist } from '$lib/server/wishlist/use-cases/reorder-wishlist.js';
import { DELETE, GET, PATCH, POST } from '../+server.js';

vi.mock('@sveltejs/kit');
vi.mock('$lib/server/protected-endpoint.js');
vi.mock('$lib/server/wishlist/use-cases/add-item.js');
vi.mock('$lib/server/wishlist/use-cases/add-item-externally.js');
vi.mock('$lib/server/wishlist/use-cases/delete-items.js');
vi.mock('$lib/server/wishlist/use-cases/get-wishlist.js');
vi.mock('$lib/server/wishlist/use-cases/reorder-wishlist.js');

describe('wishlist endpoint', () => {
  let locals;

  beforeEach(() => {
    locals = { userid: 'userid' };
    vi.mocked(json).mockImplementation((original) => original);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should get wishlist', () => {
      GET({ locals });
      expect(vi.mocked(getWishlist)).toHaveBeenCalledWith('userid');
    });

    it('should return wishlist', () => {
      vi.mocked(getWishlist).mockReturnValueOnce('wishlist');
      expect(GET({ locals })).toBe('wishlist');
    });
  });

  describe('POST', () => {
    let request;
    let url;

    beforeEach(() => {
      request = { json: vi.fn().mockResolvedValueOnce('item') };
    });

    describe('without wishlist search parameter', () => {
      beforeEach(() => {
        url = { searchParams: { get: vi.fn() } };
      });

      it('should add item', async () => {
        await POST({ locals, request, url });
        expect(vi.mocked(addItem)).toHaveBeenCalledWith('userid', 'item');
      });

      it('should return success', async () => {
        vi.mocked(addItem).mockReturnValueOnce({ added: 'item' });
        const response = await POST({ locals, request, url });
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({ added: 'item' });
      });
    });

    describe('with wishlist search parameter', () => {
      beforeEach(() => {
        url = { searchParams: { get: vi.fn(() => 'target user hash') } };
      });

      it('should add item', async () => {
        await POST({ locals, request, url });
        expect(
          vi.mocked(addItemExternally),
        ).toHaveBeenCalledWith(
          'target user hash',
          'item',
          'userid',
        );
      });

      it('should return success', async () => {
        vi.mocked(addItem).mockReturnValueOnce({ added: 'item' });
        const response = await POST({ locals, request, url });
        expect(response.status).toBe(201);
        expect(response.body).toBe(null);
      });
    });
  });

  describe('PATCH', () => {
    let request;

    beforeEach(() => {
      request = { json: vi.fn().mockResolvedValueOnce('patch') };
    });

    it('should reorder wishlist', async () => {
      await PATCH({ locals, request });
      expect(vi.mocked(reorderWishlist)).toHaveBeenCalledWith('userid', 'patch');
    });

    it('should return success', async () => {
      const response = await PATCH({ locals, request });
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('DELETE', () => {
    let request;

    beforeEach(() => {
      request = { json: vi.fn().mockResolvedValueOnce('ids') };
    });

    it('should be protected endpoint', async () => {
      await DELETE({ locals, request });
      expect(vi.mocked(protectedEndpoint)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should delete items', async () => {
      vi.mocked(protectedEndpoint).mockImplementation((useCase) => useCase());
      await DELETE({ locals, request });
      expect(vi.mocked(deleteItems)).toHaveBeenCalledWith('userid', 'ids');
    });

    it('should return protectedEndpoint response', async () => {
      vi.mocked(protectedEndpoint).mockReturnValueOnce('response');
      await expect(DELETE({ locals, request })).resolves.toBe('response');
    });
  });
});
