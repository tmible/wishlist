import { json } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addCategory } from '$lib/server/categories/use-cases/add-category.js';
import { getCategories } from '$lib/server/categories/use-cases/get-categories.js';
import { GET, POST } from '../+server.js';

vi.mock('@sveltejs/kit');
vi.mock('$lib/server/categories/use-cases/add-category.js');
vi.mock('$lib/server/categories/use-cases/get-categories.js');

describe('categories endpoint', () => {
  let locals;

  beforeEach(() => {
    locals = { userid: 'userid' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    beforeEach(() => {
      vi.mocked(json).mockImplementation((original) => original);
      vi.mocked(getCategories).mockReturnValueOnce('categories');
    });

    it('should get categories', () => {
      GET({ locals });
      expect(vi.mocked(getCategories)).toHaveBeenCalledWith('userid');
    });

    it('should return categories', () => {
      expect(GET({ locals })).toBe('categories');
    });
  });

  describe('POST', () => {
    let request;

    beforeEach(() => {
      request = { text: vi.fn().mockReturnValueOnce('text') };
      vi.mocked(addCategory).mockReturnValueOnce({ id: 'id' });
    });

    it('should add category', async () => {
      await POST({ request, locals });
      expect(vi.mocked(addCategory)).toHaveBeenCalledWith('userid', 'text');
    });

    it('should return success', async () => {
      const response = await POST({ request, locals });
      expect(response.status).toBe(201);
      expect(response.body).toBeNull();
      expect(response.headers).toEqual(new Headers({ Location: '/api/wishlist/categories/id' }));
    });
  });
});
