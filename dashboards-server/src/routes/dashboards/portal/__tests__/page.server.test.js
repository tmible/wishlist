import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PERIOD } from '$lib/constants/period.const.js';
import { createGetData } from '$lib/dashboard/network.service.js';
import { load } from '../+page.js';

let browserMock;

vi.mock('$lib/dashboard/network.service.js');
vi.mock(
  '$app/environment',
  () => ({
    get browser() {
      return browserMock;
    },
  }),
);

describe('dashboards/portal endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return placeholder object not in browser', async () => {
    browserMock = false;
    await expect(load({ fetch: 'fetch' })).resolves.toEqual({});
  });

  describe('in browser', () => {
    let getDashboardData;

    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(0);
      browserMock = true;
      getDashboardData = vi.fn().mockReturnValue([]);
      vi.mocked(createGetData).mockReturnValueOnce(getDashboardData);
    });

    it('should create dashboards data gatter', async () => {
      await load({ fetch: 'fetch' });
      expect(vi.mocked(createGetData)).toHaveBeenCalledWith('portal', 'fetch');
    });

    it('should get time dashboard data', async () => {
      await load({ fetch: 'fetch' });
      expect(getDashboardData).toHaveBeenCalledWith([ 'responseTime' ], -PERIOD.DAY);
    });

    it('should get active user dashboard data', async () => {
      await load({ fetch: 'fetch' });
      expect(getDashboardData).toHaveBeenCalledWith([ 'dau' ], -PERIOD.WEEK);
    });

    it('should get success rate data', async () => {
      await load({ fetch: 'fetch' });
      expect(getDashboardData).toHaveBeenCalledWith([ 'successRate' ], -PERIOD.DAY);
    });

    it('should get authentication funnel data', async () => {
      await load({ fetch: 'fetch' });
      expect(getDashboardData).toHaveBeenCalledWith([ 'authenticationFunnel' ], -PERIOD.DAY);
    });

    it('should return fetched data', async () => {
      getDashboardData
        .mockReturnValueOnce([ 'responseTime' ])
        .mockReturnValueOnce([ 'dau' ])
        .mockReturnValueOnce([ 'successRate' ])
        .mockReturnValueOnce([ 'authenticationFunnel' ]);
      await expect(
        load({ fetch: 'fetch' }),
      ).resolves.toEqual({
        time: {
          responseTime: 'responseTime',
        },
        activeUsers: {
          dau: 'dau',
        },
        successRate: {
          successRate: 'successRate',
        },
        authenticationFunnel: {
          authenticationFunnel: 'authenticationFunnel',
        },
      });
    });
  });
});
