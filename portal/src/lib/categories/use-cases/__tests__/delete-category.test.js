import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { deleteCategory } from '../delete-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const networkServiceMock = { deleteCategory: vi.fn() };
const storeMock = { delete: vi.fn() };

describe('categories / use cases / delete category', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.deleteCategory.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject categories network service', async () => {
    await deleteCategory('category');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
  });

  it('should delete category via network', async () => {
    await deleteCategory('category');
    expect(networkServiceMock.deleteCategory).toHaveBeenCalled();
  });

  describe('on network success', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      networkServiceMock.deleteCategory.mockResolvedValueOnce([ undefined, true ]);
      await deleteCategory('category');
    });

    it('should inject categories store', () => {
      expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
    });

    it('should delete category from store', () => {
      expect(storeMock.delete).toHaveBeenCalledWith('category');
    });
  });
});
