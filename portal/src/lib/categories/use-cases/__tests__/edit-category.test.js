import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isCategoryEdited } from '../../domain.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { editCategory } from '../edit-category.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../domain.js');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { updateCategory: vi.fn() };
const storeMock = { update: vi.fn() };

describe('categories / use cases / edit category', () => {
  beforeEach(() => {
    vi.mocked(isCategoryEdited).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should check categories equality', async () => {
    await editCategory('original category', 'edited category');
    expect(
      vi.mocked(isCategoryEdited),
    ).toHaveBeenCalledWith(
      'original category',
      'edited category',
    );
  });

  describe('if category is edited', () => {
    beforeEach(() => {
      vi.mocked(isCategoryEdited).mockReturnValue(true);
      vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
      networkServiceMock.updateCategory.mockResolvedValue([ undefined, false ]);
    });

    it('should inject categories network service', async () => {
      await editCategory('original category', 'edited category');
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });

    it('should update category via network', async () => {
      await editCategory('original category', 'edited category');
      expect(networkServiceMock.updateCategory).toHaveBeenCalledWith('edited category');
    });

    describe('on network success', () => {
      beforeEach(async () => {
        vi.mocked(inject).mockReturnValueOnce(storeMock);
        networkServiceMock.updateCategory.mockResolvedValueOnce([ undefined, true ]);
        await editCategory('original category', 'edited category');
      });

      it('should inject categories store', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
      });

      it('should update category in store', () => {
        expect(storeMock.update).toHaveBeenCalledWith('edited category');
      });
    });
  });
});
