<!-- Svelte компонент -- дашборд с метриками количества активных пользователей за разные периоды -->
<script>
  import LineDashboard from '$lib/components/line-dashboard.svelte';
  import { activeUsersDashboardCharts } from './active-users-dashboard.store.js';
  import { ACTIVE_USERS_DASHBOARD_DEFAULT_PERIOD } from './active-users-dashboard-default-period.const.js';

  /** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

  /**
   * Данные для постороения графиков
   * @type {DashboardChart['data']}
   */
  export let data;

  /**
   * Формирование пути для запроса данных для дашборда
   * @function formDataUrl
   * @param {string} chartKey Уникальный ключ графика
   * @param {number} periodStart Начало периода
   * @returns {string} Путь запроса
   */
  const formDataUrl = (chartKey, periodStart) => `/api/data/${chartKey}?periodStart=${periodStart}`;
</script>

<LineDashboard
  {data}
  chartsStore={activeUsersDashboardCharts}
  defaultPeriodSelected={ACTIVE_USERS_DASHBOARD_DEFAULT_PERIOD}
  {formDataUrl}
  labelsKey="date"
/>
