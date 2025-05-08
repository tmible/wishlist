import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkService } from '../../injection-tokens.js';
import { addItemExternally } from '../add-item-externally.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service' }));

const networkServiceMock = { addItem: vi.fn() };

describe('wishlist / use cases / add item externally', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject wishlist network service', async () => {
    await addItemExternally('form data', 'target user hash');
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
  });

  it('should add item via network', async () => {
    await addItemExternally('form data', 'target user hash');
    expect(networkServiceMock.addItem).toHaveBeenCalledWith('form data', 'target user hash');
  });
});
