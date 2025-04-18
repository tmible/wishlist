import { browser } from '$app/environment';
import { PERIOD } from '$lib/constants/period.const.js';
import { createGetData } from '$lib/dashboard/network.service.js';

/**
 * Загрузка данных для дашбордов портала
 * @type {import('./$types').PageLoad}
 */
export const load = async ({ fetch }) => {
  if (!browser) {
    return {};
  }

  const getDashboardData = createGetData('portal', fetch);
  const data = await Promise.all([
    getDashboardData([ 'responseTime' ], Date.now() - PERIOD.DAY),
    getDashboardData([ 'dau' ], Date.now() - PERIOD.WEEK),
    getDashboardData([ 'successRate' ], Date.now() - PERIOD.DAY),
    getDashboardData([ 'authenticationFunnel' ], Date.now() - PERIOD.DAY),
  ]);

  return {
    time: {
      responseTime: data[0][0],
    },
    activeUsers: {
      dau: data[1][0],
    },
    successRate: {
      successRate: data[2][0],
    },
    authenticationFunnel: {
      authenticationFunnel: data[3][0],
    },
  };
};
