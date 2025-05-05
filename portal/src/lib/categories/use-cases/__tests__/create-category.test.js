import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { createCategory } from '../create-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { createCategory: vi.fn() };
const storeMock = { add: vi.fn() };

describe('categories / use cases / create category', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.createCategory.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject categories network service', async () => {
    await createCategory({ category: 'to create' });
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
  });

  it('should create category via network', async () => {
    await createCategory({ category: 'to create' });
    expect(networkServiceMock.createCategory).toHaveBeenCalled();
  });

  describe('on network success', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      networkServiceMock.createCategory.mockResolvedValueOnce([ 'id', true ]);
      await createCategory({ category: 'to create' });
    });

    it('should inject categories store', () => {
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should add category to store', () => {
      expect(storeMock.add).toHaveBeenCalledWith({ id: 'id', category: 'to create' });
    });
  });
});
