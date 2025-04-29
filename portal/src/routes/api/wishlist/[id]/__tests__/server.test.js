import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { protectedEndpoint } from '$lib/server/protected-endpoint.js';
import { deleteItem } from '$lib/server/wishlist/use-cases/delete-item.js';
import { updateItem } from '$lib/server/wishlist/use-cases/update-item.js';
import { DELETE, PATCH } from '../+server.js';

vi.mock('$lib/server/protected-endpoint.js');
vi.mock('$lib/server/wishlist/use-cases/delete-item.js');
vi.mock('$lib/server/wishlist/use-cases/update-item.js');

describe('wishlist/[id] endpoint', () => {
  let locals;
  let params;

  beforeEach(() => {
    locals = { userid: 'userid' };
    params = { id: 'id' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH', () => {
    let request;

    beforeEach(() => {
      request = { json: vi.fn().mockResolvedValueOnce('patch') };
    });

    it('should be protected endpoint', async () => {
      await PATCH({ locals, params, request });
      expect(vi.mocked(protectedEndpoint)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should delete items', async () => {
      vi.mocked(protectedEndpoint).mockImplementation((useCase) => useCase());
      await PATCH({ locals, params, request });
      expect(vi.mocked(updateItem)).toHaveBeenCalledWith('userid', 'id', 'patch');
    });

    it('should return protectedEndpoint response', async () => {
      vi.mocked(protectedEndpoint).mockReturnValueOnce('response');
      await expect(PATCH({ locals, params, request })).resolves.toBe('response');
    });
  });

  describe('DELETE', () => {
    it('should be protected endpoint', () => {
      DELETE({ locals, params });
      expect(vi.mocked(protectedEndpoint)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should delete items', () => {
      vi.mocked(protectedEndpoint).mockImplementation((useCase) => useCase());
      DELETE({ locals, params });
      expect(vi.mocked(deleteItem)).toHaveBeenCalledWith('userid', 'id');
    });

    it('should return protectedEndpoint response', () => {
      vi.mocked(protectedEndpoint).mockReturnValueOnce('response');
      expect(DELETE({ locals, params })).toBe('response');
    });
  });
});
