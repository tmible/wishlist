import { browser } from '$app/environment';
import { getPage } from '$lib/bot-user-updates/network.service.js';
import { PERIOD } from '$lib/constants/period.const.js';
import { createGetData } from '$lib/dashboard/network.service.js';

/**
 * Загрузка данных для дашбордов бота
 * @type {import('./$types').PageLoad}
 */
export const load = async ({ fetch }) => {
  if (!browser) {
    return {};
  }

  const getDashboardData = createGetData('bot', fetch);
  const data = await Promise.all([
    getDashboardData([ 'responseTime' ], Date.now() - PERIOD.DAY),
    getDashboardData([ 'dau' ], Date.now() - PERIOD.WEEK),
    getDashboardData([ 'successRate' ], Date.now() - PERIOD.DAY),
    getPage({}, fetch),
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
    botUserUpdates: data[3][0],
  };
};
