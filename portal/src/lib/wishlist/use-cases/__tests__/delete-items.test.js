import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { deleteItems } from '../delete-items.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const networkServiceMock = { deleteItems: vi.fn() };
const storeMock = { delete: vi.fn() };

describe('wishlist / use cases / delete items', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.deleteItems.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('if there are items to delete', () => {
    it('should inject wishlist network service', async () => {
      await deleteItems([ 1, 2, 3 ]);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
    });

    it('should delete items via network', async () => {
      await deleteItems([ 1, 2, 3 ]);
      expect(networkServiceMock.deleteItems).toHaveBeenCalledWith([ 1, 2, 3 ]);
    });

    describe('on network success', () => {
      beforeEach(async () => {
        vi.mocked(inject).mockReturnValueOnce(storeMock);
        networkServiceMock.deleteItems.mockResolvedValueOnce([ undefined, true ]);
        await deleteItems([ 1, 2, 3 ]);
      });

      it('should inject wishlist store', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
      });

      it('should delete items from store', () => {
        expect(storeMock.delete).toHaveBeenCalledWith([ 1, 2, 3 ]);
      });
    });
  });
});
