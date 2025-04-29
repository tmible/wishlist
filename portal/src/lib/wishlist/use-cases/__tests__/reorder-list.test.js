import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { reorderList } from '../reorder-list.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const networkServiceMock = { reorderList: vi.fn() };
const storeMock = { reorder: vi.fn() };

describe('wishlist / use cases / reorder list', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.reorderList.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('if there are items in patch', () => {
    it('should inject wishlist network service', async () => {
      await reorderList([ 1, 2, 3 ]);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
    });

    it('should reorder list via network', async () => {
      await reorderList([ 1, 2, 3 ]);
      expect(networkServiceMock.reorderList).toHaveBeenCalledWith([ 1, 2, 3 ]);
    });

    describe('on network success', () => {
      beforeEach(async () => {
        vi.mocked(inject).mockReturnValueOnce(storeMock);
        networkServiceMock.reorderList.mockResolvedValueOnce([ undefined, true ]);
        await reorderList([ 1, 2, 3 ]);
      });

      it('should inject wishlist store', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
      });

      it('should reorder list in store', () => {
        expect(storeMock.reorder).toHaveBeenCalledWith([ 1, 2, 3 ]);
      });
    });
  });
});
