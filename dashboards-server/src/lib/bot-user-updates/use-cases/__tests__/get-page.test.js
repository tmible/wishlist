import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Cache, NetworkService, Store } from '../../injection-tokens.js';
import { getPage } from '../get-page.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const cacheMock = { get: vi.fn(), set: vi.fn() };
const networkServiceMock = { getPage: vi.fn() };
const storeMock = { set: vi.fn() };

describe('bot user updates / use cases / get page', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(cacheMock).mockReturnValueOnce(storeMock);
    cacheMock.get.mockReturnValue('page from cache');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject cache', async () => {
    await getPage();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Cache);
  });

  it('should inject store', async () => {
    await getPage();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
  });

  it('should get page from cache', async () => {
    await getPage('timeLock', 'index', 'filters');
    expect(cacheMock.get).toHaveBeenCalledWith('filters', 'index');
  });

  it('should set page to store if there is one in cache', async () => {
    await getPage();
    expect(storeMock.set).toHaveBeenCalledWith('page from cache');
  });

  describe('if there is no page in cache', () => {
    const pageFromNetwork = { page: 'page from network', index: 'index from network' };

    beforeEach(() => {
      vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
      cacheMock.get.mockReturnValueOnce();
      networkServiceMock.getPage.mockResolvedValueOnce([ pageFromNetwork, 'ok' ]);
    });

    it('should inject network service', async () => {
      await getPage();
      expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
    });

    it('should get page via network', async () => {
      await getPage('timeLock', 'index', 'filters');
      expect(
        networkServiceMock.getPage,
      ).toHaveBeenCalledWith({
        timeLock: 'timeLock',
        index: 'index',
        filters: 'filters',
      });
    });

    describe('if response status is ok', () => {
      it('should set page to cache', async () => {
        await getPage('timeLock', 'index', 'filters');
        expect(
          cacheMock.set,
        ).toHaveBeenCalledWith(
          'filters',
          'index from network',
          pageFromNetwork,
        );
      });

      it('should set page to store', async () => {
        await getPage();
        expect(storeMock.set).toHaveBeenCalledWith(pageFromNetwork);
      });
    });
  });
});
