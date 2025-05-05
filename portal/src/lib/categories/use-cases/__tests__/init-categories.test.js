import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { initCategories } from '../init-categories.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { getCategories: vi.fn() };
const storeMock = { get: vi.fn().mockReturnValue([]), set: vi.fn() };

describe('categories / use cases / init categories', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(storeMock).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.getCategories.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('if store is empty', () => {
    it('should inject categories network service', async () => {
      await initCategories();
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });

    it('should get categories via network', async () => {
      await initCategories();
      expect(networkServiceMock.getCategories).toHaveBeenCalled();
    });

    describe('on network success', () => {
      beforeEach(async () => {
        networkServiceMock.getCategories.mockResolvedValueOnce([ 'categories', true ]);
        await initCategories();
      });

      it('should inject categories store', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
      });

      it('should set categories to store', () => {
        expect(storeMock.set).toHaveBeenCalledWith('categories');
      });
    });
  });
});
