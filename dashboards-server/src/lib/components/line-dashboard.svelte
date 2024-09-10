<!-- Svelte компонент -- шаблонный дашборд с графиками-линиями -->
<script>
  import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
  import { isDarkTheme } from '@tmible/wishlist-common/theme-service';
  import { Chart } from 'chart.js/auto';
  /* eslint-disable-next-line
     import/default, import/no-named-as-default, import/no-named-as-default-member --
     Ошибка из-за версии eslint */
  import annotationPlugin from 'chartjs-plugin-annotation';
  import { PERIOD } from '$lib/constants/period.const.js';
  import { getData } from '$lib/get-data.js';
  import Dashboard from './dashboard.svelte';

  /** @typedef {import('chart.js').ChartConfiguration} ChartConfiguration */
  /** @typedef {import('svelte/store').Writable} Writable */
  /** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

  Chart.register(annotationPlugin);

  /**
   * Цвет координатной сетки в светлой теме
   * @constant {string}
   */
  const GRID_LIGHT_COLOR = 'rgba(0,0,0,0.1)';

  /**
   * Данные для постороения графиков
   * @type {DashboardChart['data']}
   */
  export let data;

  /**
   * Svelte хранилище с информацией для построения графиков
   * @type {Writable<DashboardChart[]> | null}
   */
  export let chartsStore;

  /**
   * Признак автоматического обновления дашборда
   * @type {boolean}
   */
  export let isAutoUpdating = false;

  /**
   * Период отображения для дашборда по умолчанию
   * @type {PERIOD | number}
   */
  export let defaultPeriodSelected = PERIOD.DAY;

  /**
   * Формирование пути для запроса данных для графиков
   * @type {(chartKey: string, periodStart: number) => string}
   */
  export let formDataUrl;

  /**
   * Ключ для значений горизонтальной оси в объектах данных для построения графика
   * @type {string}
   */
  export let labelsKey = 'time';

  /**
   * Формат даты для отображения в тултипе, появляющемся при наведении курсора на точку графика
   * @type {string}
   */
  export let tooltipFormat = 'D.MM.YYYY';

  /**
   * Параметры для настройки вертикальной оси графика
   * @type {object}
   */
  export let yScaleOptions = {};

  /**
   * Нахождение медианы в массиве точек графика
   * @function median
   * @param {object} ctx Контекст графика
   * @returns {number} Медиана точек графика
   */
  const median = (ctx) => {
    const values = ctx.chart.data.datasets[0]?.data.slice().sort((a, b) => a - b) ?? [];
    const half = Math.floor(values.length / 2);
    return (values.length % 2 === 1 ? values[half] : (values[half - 1] + values[half]) / 2);
  };

  /**
   * Получение данных для графиков и обновление графиков в дашборде
   * @function getDataAndUpdateChartProps
   * @param {Chart} dashboard Дашборд
   * @param {number} periodStart Начало периода
   * @param {number} periodSelected Длительность периода
   * @param {boolean} shouldRequestAll Признак необходимости запроса данных для всех графиков
   * @returns {Promise<void>}
   * @async
   */
  const getDataAndUpdateChartProps = async (
    dashboard,
    periodStart,
    periodSelected,
    shouldRequestAll,
  ) => {
    if (isAutoUpdating && shouldRequestAll) {
      $chartsStore
        .filter(({ isDisplayed }) => !isDisplayed)
        .forEach((chart) => {
          chart.data = [];
          chart.period = undefined;
        });
    }

    await Promise.all(
      $chartsStore
        /* eslint-disable-next-line arrow-body-style --
          Для читаемости и соблюдения требований к длине строки */
        .filter(({ isDisplayed, period }) => {
          return isDisplayed && (shouldRequestAll || period !== periodSelected);
        })
        .map((chart) => getData(formDataUrl(chart.key, periodStart)).then((data) => {
          chart.data = data;
          chart.period = periodSelected;
          dashboard.data.labels = data.map((item) => item[labelsKey]);
        })),
    );

    const previousDatasetsLength = dashboard.data.datasets.length;

    dashboard.data.datasets = $chartsStore
      .filter(({ isDisplayed }) => isDisplayed)
      .map(({ key, label, data }) => ({
        label,
        data: data.map((item) => item[key]),
        pointHitRadius: 10,
      }));
    dashboard.options.scales.x.min = periodStart;
    dashboard.options.scales.x.max = Date.now();
    dashboard.options.scales.x.time.minUnit = periodSelected >= PERIOD.WEEK ?
      'day' :
      (periodSelected >= PERIOD.SIX_HOURS ?
        'hour' :
        'minute'
      );

    dashboard.update(previousDatasetsLength === 0 ? undefined : 'none');
  };

  /**
   * Формирование параметров дашборда для его создания
   * @function formChartOptions
   * @param {DashboardChart['data']} data Данные для построения графиков
   * @param {number} periodStart Начало периода
   * @returns {ChartConfiguration}
   */
  /* eslint-disable-next-line max-lines-per-function --
    Просто большой конфиг для графика */
  const formChartOptions = (data, periodStart) => {
    const gridOptions = {
      grid: {
        color: isDarkTheme() ?
          `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--secondary')})` :
          GRID_LIGHT_COLOR,
      },
    };

    return {
      type: 'line',
      data: {
        labels: data[0].map((item) => item[labelsKey]),
        datasets: $chartsStore
          .filter(({ isDisplayed }) => isDisplayed)
          .map(({ key, label, data }) => ({
            label,
            data: data.map((item) => item[key]),
            pointHitRadius: 10,
          })),
      },
      options: {
        scales: {
          x: {
            type: 'time',
            min: periodStart,
            max: Date.now(),
            ...gridOptions,
            ticks: {
              maxRotation: 0,
              autoSkipPadding: 20,
            },
            time: {
              displayFormats: {
                minute: 'HH:mm',
                hour: 'HH:00',
                day: 'DD.MM',
              },
              tooltipFormat,
            },
          },
          y: {
            min: 0,
            ...gridOptions,
            ...yScaleOptions,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              annotation: {
                type: 'line',
                borderColor: `hsl(${
                  getComputedStyle(document.documentElement).getPropertyValue('--foreground')
                })`,
                borderDash: [ 6, 6 ],
                borderDashOffset: 0,
                borderWidth: 2,
                label: {
                  display: true,
                  content: (ctx) => `Медиана: ${median(ctx).toFixed(2)}`,
                  position: 'end',
                },
                scaleID: 'y',
                value: (ctx) => median(ctx),
              },
            },
          },
        },
      },
    };
  };

  /**
   * Обновление цветов графиков при смене темы
   * @function themeSubscriber
   * @param {boolean} isDark Признак активности тёмной темы
   * @param {Chart} dashboard Дашборд
   * @returns {void}
   */
  const themeSubscriber = (isDark, dashboard) => {
    const foreground = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
    const secondary = getComputedStyle(document.documentElement).getPropertyValue('--secondary');

    dashboard.config.options.plugins.annotation.annotations.annotation.borderColor =
      `hsl(${foreground})`;
    dashboard.config.options.scales.x.grid.color = isDark ? `hsl(${secondary})` : GRID_LIGHT_COLOR;
    dashboard.config.options.scales.y.grid.color = isDark ? `hsl(${secondary})` : GRID_LIGHT_COLOR;

    dashboard.update();
  };
</script>

<Dashboard
  {data}
  {chartsStore}
  {formChartOptions}
  {getDataAndUpdateChartProps}
  {isAutoUpdating}
  {defaultPeriodSelected}
  {themeSubscriber}
/>
