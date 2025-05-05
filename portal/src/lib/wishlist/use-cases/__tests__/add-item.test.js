import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assignOrderToNewItem } from '../../domain.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { addItem } from '../add-item.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../domain.js');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { addItem: vi.fn() };
const storeMock = { get: vi.fn(), add: vi.fn() };

describe('wishlist / use cases / add item', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(storeMock).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.addItem.mockResolvedValue([ undefined, false ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject wishlist store', async () => {
    await addItem('formData');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
  });

  it('should get item from store', async () => {
    await addItem('formData');
    expect(storeMock.get).toHaveBeenCalled();
  });

  it('should assign order', async () => {
    storeMock.get.mockReturnValueOnce('list');
    await addItem('formData');
    expect(vi.mocked(assignOrderToNewItem)).toHaveBeenCalledWith('list', 'formData');
  });

  it('should inject wishlist network service', async () => {
    await addItem('formData');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
  });

  it('should add item via network', async () => {
    await addItem('formData');
    expect(networkServiceMock.addItem).toHaveBeenCalledWith('formData');
  });

  it('should add item to store on network success', async () => {
    networkServiceMock.addItem.mockResolvedValueOnce([ 'item', true ]);
    await addItem('formData');
    expect(storeMock.add).toHaveBeenCalledWith('item');
  });
});
