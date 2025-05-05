import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService, Store } from '../../injection-tokens.js';
import { getList } from '../get-list.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { getList: vi.fn() };
const storeMock = { set: vi.fn() };

describe('wishlist / use cases / get list', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.getList.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject wishlist network service', async () => {
    await getList();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
  });

  it('should get wishlist via network', async () => {
    await getList();
    expect(networkServiceMock.getList).toHaveBeenCalled();
  });

  describe('on network success', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      networkServiceMock.getList.mockResolvedValueOnce([ 'list', true ]);
      await getList();
    });

    it('should inject wishlist store', () => {
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should set list to store', () => {
      expect(storeMock.set).toHaveBeenCalledWith('list');
    });
  });
});
