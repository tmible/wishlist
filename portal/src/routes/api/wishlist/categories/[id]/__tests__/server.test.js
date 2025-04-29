import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteCategory } from '$lib/server/categories/use-cases/delete-category.js';
import { updateCategory } from '$lib/server/categories/use-cases/update-category.js';
import { protectedEndpoint } from '$lib/server/protected-endpoint.js';
import { DELETE, PUT } from '../+server.js';

vi.mock('$lib/server/protected-endpoint.js');
vi.mock('$lib/server/categories/use-cases/delete-category.js');
vi.mock('$lib/server/categories/use-cases/update-category.js');

describe('categories/[id] endpoint', () => {
  let locals;
  let params;

  beforeEach(() => {
    locals = { userid: 'userid' };
    params = { id: 'id' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PUT', () => {
    let request;

    beforeEach(() => {
      request = { text: vi.fn(() => 'text') };
    });

    it('should be authorization protected endpoint', async () => {
      await PUT({ locals, params, request });
      expect(vi.mocked(protectedEndpoint)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should update category', async () => {
      vi.mocked(protectedEndpoint).mockImplementationOnce((useCase) => useCase());
      await PUT({ locals, params, request });
      expect(vi.mocked(updateCategory)).toHaveBeenCalledWith('userid', { id: 'id', name: 'text' });
    });

    it('should return response', async () => {
      vi.mocked(protectedEndpoint).mockReturnValueOnce('response');
      await expect(PUT({ locals, params, request })).resolves.toBe('response');
    });
  });

  describe('DELETE', () => {
    it('should be authorization protected endpoint', () => {
      DELETE({ locals, params });
      expect(vi.mocked(protectedEndpoint)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should delete category', () => {
      vi.mocked(protectedEndpoint).mockImplementationOnce((useCase) => useCase());
      DELETE({ locals, params });
      expect(vi.mocked(deleteCategory)).toHaveBeenCalledWith('userid', 'id');
    });

    it('should return response', () => {
      vi.mocked(protectedEndpoint).mockReturnValueOnce('response');
      expect(DELETE({ locals, params })).toBe('response');
    });
  });
});
