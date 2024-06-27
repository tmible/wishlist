import { writable } from 'svelte/store';

/** @typedef {import('svelte/store').Writable} Writable */
/** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

/**
 * Svelte хранилище данных для дашборда с метриками
 * времени, потраченного ботом, за разные периоды
 * @constant {Writable<DashboardChart[]>}
 */
export const timeDashboardCharts = writable([{
  key: 'responseTime',
  label: 'время ответа',
  isDisplayed: true,
  period: undefined,
  data: [],
}, {
  key: 'processTime',
  label: 'время обработки обновления',
  isDisplayed: false,
  period: undefined,
  data: [],
}, {
  key: 'startupTime',
  label: 'время до начала ответа',
  isDisplayed: false,
  period: undefined,
  data: [],
}]);
