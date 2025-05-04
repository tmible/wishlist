import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPage } from '$lib/bot-user-updates/network.service.js';
import { PERIOD } from '$lib/constants/period.const.js';
import { createGetData } from '$lib/dashboard/network.service.js';
import { load } from '../+page.js';

let browserMock;

vi.mock('$lib/bot-user-updates/network.service.js');
vi.mock('$lib/dashboard/network.service.js');
vi.mock(
  '$app/environment',
  () => ({
    get browser() {
      return browserMock;
    },
  }),
);

describe('dashboards/bot endpoint', () => {
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
      vi.mocked(getPage).mockReturnValue([]);
      vi.mocked(createGetData).mockReturnValueOnce(getDashboardData);
    });

    it('should create dashboards data gatter', async () => {
      await load({ fetch: 'fetch' });
      expect(vi.mocked(createGetData)).toHaveBeenCalledWith('bot', 'fetch');
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

    it('should get user sessions data', async () => {
      await load({ fetch: 'fetch' });
      expect(vi.mocked(getPage)).toHaveBeenCalledWith({}, 'fetch');
    });

    it('should return fetched data', async () => {
      getDashboardData
        .mockReturnValueOnce([ 'responseTime' ])
        .mockReturnValueOnce([ 'dau' ])
        .mockReturnValueOnce([ 'successRate' ]);
      vi.mocked(getPage).mockReturnValueOnce([ 'botUserUpdates' ]);
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
        botUserUpdates: 'botUserUpdates',
      });
    });
  });
});
