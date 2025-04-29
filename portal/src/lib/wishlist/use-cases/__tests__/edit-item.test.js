import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { patchItem } from '../../domain.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { editItem } from '../edit-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../domain.js');

const networkServiceMock = { patchItem: vi.fn() };
const storeMock = { update: vi.fn() };

describe('wishlist / use cases / edit item', () => {
  beforeEach(() => {
    vi.mocked(patchItem).mockReturnValue([ false, undefined ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should patch item in domain', async () => {
    await editItem('item', 'patch');
    expect(vi.mocked(patchItem)).toHaveBeenCalledWith('item', 'patch');
  });

  describe('if item is modified', () => {
    beforeEach(() => {
      vi.mocked(patchItem).mockReturnValue([ true, 'itemPatched', 'patchFiltered' ]);
      vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
      networkServiceMock.patchItem.mockResolvedValue([ undefined, false ]);
    });

    it('should inject wishlist network service', async () => {
      await editItem('item', 'patch');
      expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
    });

    it('should update item via network', async () => {
      await editItem('item', 'patch');
      expect(networkServiceMock.patchItem).toHaveBeenCalledWith('item', 'patchFiltered');
    });

    describe('on network success', () => {
      beforeEach(async () => {
        vi.mocked(inject).mockReturnValueOnce(storeMock);
        networkServiceMock.patchItem.mockResolvedValue([ undefined, true ]);
        await editItem('item', 'patch');
      });

      it('should inject wishlist store', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
      });

      it('should update item in store', () => {
        expect(storeMock.update).toHaveBeenCalledWith('itemPatched');
      });
    });
  });
});
