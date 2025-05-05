import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setUserHash } from '../../domain.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { getHash } from '../get-hash.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../domain.js');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { getHash: vi.fn() };
const storeMock = { get: vi.fn(), set: vi.fn() };

describe('user / use cases / get hash', () => {
  let userFromStore;

  beforeEach(() => {
    userFromStore = { hash: 'hash from store', user: 'from store' };
    vi.mocked(inject).mockReturnValueOnce(storeMock);
    storeMock.get.mockReturnValue(userFromStore);
    networkServiceMock.getHash.mockResolvedValueOnce('hash from network');
    vi.mocked(setUserHash).mockReturnValueOnce('user with hash');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject user store', async () => {
    await getHash();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
  });

  it('should get user from store', async () => {
    await getHash();
    expect(storeMock.get).toHaveBeenCalled();
  });

  it('should return hash from store if user has hash ', async () => {
    await expect(getHash()).resolves.toBe('hash from store');
  });

  describe('if there is no hash in store', () => {
    beforeEach(() => {
      vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
      userFromStore.hash = null;
    });

    it('should inject network service', async () => {
      await getHash();
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });

    it('should get hash via network', async () => {
      await getHash();
      expect(networkServiceMock.getHash).toHaveBeenCalled();
    });

    it('should set user hash', async () => {
      await getHash();
      expect(vi.mocked(setUserHash)).toHaveBeenCalledWith(userFromStore, 'hash from network');
    });

    it('should set user in store', async () => {
      await getHash();
      expect(storeMock.set).toHaveBeenCalledWith('user with hash');
    });

    it('should return hash', async () => {
      await expect(getHash()).resolves.toBe('hash from network');
    });
  });
});
