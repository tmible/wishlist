import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { getData } from '$lib/get-data';
import { activeUsersDashboardCharts } from '../active-users-dashboard.store';
import { ACTIVE_USERS_DASHBOARD_DEFAULT_PERIOD } from '../active-users-dashboard-default-period.const';
import { SUCCESS_RATE_DASHBOARD_DEFAULT_PERIOD } from '../success-rate-dashboard-default-period.const';
import { timeDashboardCharts } from '../time-dashboard.store';
import { TIME_DASHBOARD_DEFAULT_PERIOD } from '../time-dashboard-default-period.const';

/**
 * Загрузка данных для дашбордов бота
 * @type {import('./$types').PageLoad}
 */
export const load = async ({ fetch }) => ({
  timeDashboard: browser ?
    await Promise.all(
      get(timeDashboardCharts)
        .filter(({ isDisplayed }) => isDisplayed)
        .map(({ key }) => getData(
          `/api/data/${key}?periodStart=${Date.now() - TIME_DASHBOARD_DEFAULT_PERIOD}`,
          fetch,
        )),
    ) :
    [],
  activeUsersDashboard: browser ?
    await Promise.all(
      get(activeUsersDashboardCharts)
        .filter(({ isDisplayed }) => isDisplayed)
        .map(({ key }) => getData(
          `/api/data/${key}?periodStart=${Date.now() - ACTIVE_USERS_DASHBOARD_DEFAULT_PERIOD}`,
          fetch,
        )),
    ) :
    [],
  successRate: browser ?
    await getData(
      `/api/data/successRate?periodStart=${Date.now() - SUCCESS_RATE_DASHBOARD_DEFAULT_PERIOD}`,
      fetch,
    ) :
    null,
  userSessions: browser ? await getData('/api/data/userSessions', fetch) : [],
});
