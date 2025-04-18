import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from '$lib/auth-interceptor.js';
import { createGetData } from '../network.service.js';

vi.mock('$lib/auth-interceptor.js', () => ({ authInterceptor: vi.fn((argument) => argument) }));

describe('dashboard / network service', () => {
  const fetchMock = vi.fn(
    (argument) => Promise.resolve({
      json: vi.fn().mockResolvedValue(argument),
    }),
  );

  let getData;

  beforeEach(() => {
    getData = createGetData('service', fetchMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data', async () => {
    await getData([ 'key 1' ], 'periodStart');
    expect(fetchMock).toHaveBeenCalledWith('/api/data/service/key 1?periodStart=periodStart');
  });

  it('should check authentication', async () => {
    await getData([ 'key 1' ], 'periodStart');
    expect(vi.mocked(authInterceptor)).toHaveBeenCalled();
  });

  it('should return parsed JSON', async () => {
    const keys = [ 'key 1', 'key 2' ];
    await expect(
      getData(keys, 'periodStart'),
    ).resolves.toEqual(
      keys.map((key) => `/api/data/service/${key}?periodStart=periodStart`),
    );
  });
});
