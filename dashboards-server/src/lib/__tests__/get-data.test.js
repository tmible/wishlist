import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated.js';
import { getData } from '../get-data.js';

const fetchMock = vi.fn(() => Promise.resolve({ status: 200, json: () => {} }));
vi.stubGlobal('fetch', fetchMock);
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$lib/store/is-authenticated.js', () => ({ isAuthenticated: { set: vi.fn() } }));

describe('getData', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should fetch', async () => {
    await getData('path');
    expect(fetch).toHaveBeenCalledWith('path');
  });

  describe('if server responds 401', () => {
    beforeEach(() => {
      fetchMock.mockReturnValue(Promise.resolve({ status: 401 }));
    });

    it('should update store', async () => {
      try {
        await getData('path');
      } catch (e) {
        if (e.message !== 'Got 401 response') {
          throw e;
        }
        expect(isAuthenticated.set).toHaveBeenCalledWith(false);
      }
    });

    it('should redirect to /login', async () => {
      try {
        await getData('path');
      } catch (e) {
        if (e.message !== 'Got 401 response') {
          throw e;
        }
        expect(goto).toHaveBeenCalledWith('/login');
      }
    });

    it('should throw error', async () => {
      await expect(getData('path')).rejects.toEqual(new Error('Got 401 response'));
    });
  });

  it('should return answer if server responds not 401', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ status: 200, json: () => 'response' }));
    expect(await getData('path')).toEqual('response');
  });
});
