import { writable } from 'svelte/store';

/** @typedef {import('svelte/store').Writable} Writable */
/** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

/**
 * Svelte хранилище данных для дашборда с метриками
 * количества активных пользователей за разные периоды
 * @constant {Writable<DashboardChart[]>}
 */
export const activeUsersDashboardCharts = writable([{
  key: 'dau',
  label: 'уникальные пользователи за сутки',
  isDisplayed: true,
  period: undefined,
  data: [],
}, {
  key: 'mau',
  label: 'уникальные пользователи за месяц',
  isDisplayed: false,
  period: undefined,
  data: [],
}, {
  key: 'yau',
  label: 'уникальные пользователи за год',
  isDisplayed: false,
  period: undefined,
  data: [],
}]);
