<!-- Svelte компонент -- дашборд с долей успешно обработанных ботом обновлений -->
<script>
  import Dashboard from '$lib/components/dashboard.svelte';
  import { getData } from '$lib/get-data.js';
  import { SUCCESS_RATE_DASHBOARD_DEFAULT_PERIOD } from './success-rate-dashboard-default-period.const.js';

  /** @typedef {import('chart.js/auto').Chart} Chart */
  /** @typedef {import('chart.js').ChartConfiguration} ChartConfiguration */
  /** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

  /**
   * Цвет для обозначения доли успешно обработанных ботом обновлений на графике
   * @constant {string}
   */
  const SUCCESS_COLOR = '#00B594';

  /**
   * Цвет для обозначения доли ошибок на графике
   * @constant {string}
   */
  const ERROR_COLOR = '#F93C2C';

  /**
   * Данные для постороения графиков
   * @type {number}
   */
  export let data;

  /**
   * Цвет фона
   * @function getBackgroundColor
   * @returns {string} CSS строка с hsl цветом
   */
  const getBackgroundColor = () => `hsl(${
    getComputedStyle(document.documentElement).getPropertyValue('--background')
  })`;

  /**
   * Получение данных для графиков и обновление графиков в дашборде
   * @function getDataAndUpdateChartProps
   * @param {Chart} dashboard Дашборд
   * @param {number} periodStart Начало периода
   * @returns {Promise<void>}
   * @async
   */
  const getDataAndUpdateChartProps = async (dashboard, periodStart) => {
    const successRate = await getData(`/api/data/successRate?periodStart=${periodStart}`);
    dashboard.data.datasets[0].data = successRate ? [ successRate, (1 - successRate) ] : [ 1 ];
    dashboard.options.borderColor = successRate ? getBackgroundColor() : SUCCESS_COLOR;
    dashboard.options.cutout = successRate ? '50%' : '100%';
    dashboard.update();
  };

  /**
   * Формирование параметров дашборда для его создания
   * @function formChartOptions
   * @param {number} successRate Доля успешно обработанных ботом обновлений
   * @returns {ChartConfiguration} Параметры дашборда
   */
  const formChartOptions = (successRate) => ({
    type: 'doughnut',
    data: {
      labels: [
        'success rate',
        'error rate',
      ],
      datasets: [{
        data: successRate ? [ successRate, (1 - successRate) ] : [ 1 ],
        backgroundColor: [ SUCCESS_COLOR, ERROR_COLOR ],
      }],
    },
    options: {
      borderColor: successRate ? getBackgroundColor() : SUCCESS_COLOR,
      cutout: successRate ? '50%' : '100%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => ` ${(context.raw * 100).toFixed(2)}%`,
          },
        },
      },
    },
  });

  /**
   * Обновление цветов графика при смене темы
   * @function themeSubscriber
   * @param {boolean} isDark Признак активности тёмной темы
   * @param {Chart} dashboard Дашборд
   * @returns {void}
   */
  const themeSubscriber = (isDark, dashboard) => {
    if (dashboard.config.options.borderColor === SUCCESS_COLOR) {
      return;
    }

    dashboard.config.options.borderColor = getBackgroundColor();
    dashboard.update();
  };
</script>

<Dashboard
  {data}
  defaultPeriodSelected={SUCCESS_RATE_DASHBOARD_DEFAULT_PERIOD}
  {formChartOptions}
  {getDataAndUpdateChartProps}
  isHalfWidth={true}
  {themeSubscriber}
  let:dashboard={dashboard}
>
  {#if dashboard?.data.datasets[0]?.data?.length > 0}
    <svg class="dashboard-caption" viewBox="0 0 130 30">
      <text x="8" y="21">Success rate</text>
    </svg>
  {/if}
</Dashboard>

<style>
  .dashboard-caption {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .dashboard-caption > text {
    font-size: 20px;
    fill: hsl(var(--foreground));
  }
</style>
