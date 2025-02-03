<!-- Svelte компонент -- дашборд с метриками времени, потраченного ботом, за разные периоды -->
<script>
  import LineDashboard from '$lib/components/line-dashboard.svelte';
  import { timeDashboardCharts } from './time-dashboard.store.js';
  import { TIME_DASHBOARD_DEFAULT_PERIOD } from './time-dashboard-default-period.const.js';

  /** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

  /**
   * Данные для постороения графиков
   * @type {DashboardChart['data']}
   */
  export let data;

  /**
   * Ключ сервиса в объекте с данными о проверке здороья сервисов
   * @type {'bot' | 'portal' | 'hub'}
   */
  export let service;
</script>

<!-- eslint-disable svelte/mustache-spacing -->
<LineDashboard
  {data}
  chartsStore={timeDashboardCharts}
  formDataUrl={
    (chartKey, periodStart) => `/api/data/${service}/${chartKey}?periodStart=${periodStart}`
  }
  isAutoUpdating={true}
  defaultPeriodSelected={TIME_DASHBOARD_DEFAULT_PERIOD}
  tooltipFormat="D.MM.YYYY H:mm:ss.SSS"
  yScaleOptions={{
    title: {
      display: true,
      text: 'мс',
    },
  }}
/>
<!-- eslint-enable svelte/mustache-spacing -->
