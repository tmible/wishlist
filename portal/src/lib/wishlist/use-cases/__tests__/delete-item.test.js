import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { deleteItem } from '../delete-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const networkServiceMock = { deleteItem: vi.fn() };
const storeMock = { delete: vi.fn() };

describe('wishlist / use cases / delete item', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.deleteItem.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject wishlist network service', async () => {
    await deleteItem('item');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
  });

  it('should delete item via network', async () => {
    await deleteItem('item');
    expect(networkServiceMock.deleteItem).toHaveBeenCalledWith('item');
  });

  describe('on network success', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      networkServiceMock.deleteItem.mockResolvedValueOnce([ undefined, true ]);
      await deleteItem({ id: 'itemId' });
    });

    it('should inject wishlist store', () => {
      expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
    });

    it('should delete item from store', () => {
      expect(storeMock.delete).toHaveBeenCalledWith([ 'itemId' ]);
    });
  });
});
