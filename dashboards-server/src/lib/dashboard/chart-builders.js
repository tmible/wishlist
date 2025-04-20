import { inject } from '@tmible/wishlist-common/dependency-injector';
import { browser } from '$app/environment';
import { PERIOD } from '$lib/constants/period.const.js';
import { ThemeService } from '$lib/theme-service-injection-token.js';

/** @typedef {import('chart.js').ChartConfiguration} ChartConfiguration */
/** @typedef {import('./domain.js').Dashboard} Dashboard */
/** @typedef {import('./domain.js').LineDashboard} LineDashboard */

/** @module Построение конфигов для графиков дашбордов */

/* eslint-disable jsdoc/check-template-names, jsdoc/valid-types --
  Валидный TS, но невалидный JSDoc */
/**
 * @template {Dashboard} [D=Dashboard]
 * @typedef {(D['charts'] extends Map<unknown, infer C> ? C : never)[]} DashboardChart
 */
/* eslint-enable jsdoc/check-template-names, jsdoc/valid-types */

/**
 * Цвет координатной сетки в светлой теме
 * @constant {string}
 */
const GRID_LIGHT_COLOR = 'rgba(0,0,0,0.1)';

/**
 * Получение hex цвета из CSS переменной
 * @function getColorFromStyles
 * @param {string} colorName Название цвета
 * @returns {string} hex цвет
 */
const getColorFromStyles = (colorName) => browser && getComputedStyle(
  document.documentElement,
).getPropertyValue(
  `--color-${colorName}`,
);

/**
 * Цвет успеха
 * @type {string}
 */
const successColor = getColorFromStyles('success');

/**
 * Цвет ошибки
 * @type {string}
 */
const errorColor = getColorFromStyles('error');

/**
 * Нахождение медианы в массиве точек графика
 * @function median
 * @param {object} ctx Контекст графика // no type declared for this parameter in chart.js docs
 * @returns {number} Медиана точек графика
 */
const median = (ctx) => {
  const values = ctx.chart.data.datasets[0]?.data.slice().sort((a, b) => a - b) ?? [];
  const half = Math.floor(values.length / 2);
  return (values.length % 2 === 1 ? values[half] : (values[half - 1] + values[half]) / 2);
};

/**
 * Построение конфига для дашборда с графиком в виде кольца
 * @function line
 * @param {string[]} labels Подписи к линиям на графике
 * @param {DashboardChart<LineDashboard>[]} charts Данные для построения линий
 * @param {number} periodStart Таймштамп начала выбранного для отображения периода
 * @param {Partial<ChartConfiguration['options']['scales']['y']>} yScaleOptions
 *   Дополнительные опции для настройки отображения оси Oy
 * @param {string} tooltipFormat Формат даты в тултипе
 * @param {PERIOD} periodSelected Выбранный для отображения период
 * @returns {ChartConfiguration} Конфигурация графика chart.js
 */
// eslint-disable-next-line max-lines-per-function -- большой конфиг, нет смысла разбивать
const line = (labels, charts, periodStart, yScaleOptions, tooltipFormat, periodSelected) => {
  const gridOptions = {
    grid: {
      color: inject(ThemeService).isDarkTheme() ?
        getColorFromStyles('secondary') :
        GRID_LIGHT_COLOR,
    },
  };

  return {
    type: 'line',
    data: {
      labels,
      datasets: charts.map(({ label, data }) => ({
        label,
        data: data?.map(({ value }) => value) ?? [],
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
            minUnit: periodSelected >= PERIOD.WEEK ?
              'day' :
              (periodSelected >= PERIOD.SIX_HOURS ?
                'hour' :
                'minute'),
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
              borderColor: getColorFromStyles('base-content'),
              borderDash: [ 6, 6 ],
              borderDashOffset: 0,
              borderWidth: 2,
              label: {
                display: true,
                content: (ctx) => `Медиана: ${median(ctx)}`,
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
 * Построение конфига для дашборда с графиком в виде кольца
 * @function doughnut
 * @param {string[]} labels Подписи к секторам кольца
 * @param {number[]} data Данные для отображения
 * @param {string[]} backgroundColor Цвет фона для каждого сектора кольца
 * @param {string} borderColor Цвет границ секторов
 * @param {string} cutout Отношение внутреннего радиуса кольцо ко внешнему в процентах
 * @returns {ChartConfiguration} Конфигурация графика chart.js
 */
const doughnut = (labels, data, backgroundColor, borderColor, cutout) => ({
  type: 'doughnut',
  data: {
    labels,
    datasets: [{
      data,
      backgroundColor,
    }],
  },
  options: {
    borderColor,
    cutout,
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
 * Отображение типов дашбордов в функции построения конфигов графиков
 * @constant {{
 *   [key: string]: (
 *     charts: DashboardChart[],
 *     periodStart: number,
 *     periodSelected: PERIOD,
 *  ) => ChartConfiguration
 * }}
 */
export const ChartBuilders = {
  time: (charts, periodStart, periodSelected) => line(
    charts[0]?.data?.map((item) => item.timestamp) ?? [],
    charts,
    periodStart,
    { title: { display: true, text: 'мс' } },
    'D.MM.YYYY H:mm:ss.SSS',
    periodSelected,
  ),
  activeUsers: (charts, periodStart, periodSelected) => line(
    charts[0]?.data?.map((item) => item.timestamp) ?? [],
    charts,
    periodStart,
    {},
    'D.MM.YYYY',
    periodSelected,
  ),
  successRate: (charts) => {
    const successRate = charts[0].data;
    return doughnut(
      [ 'success rate', 'error rate' ],
      successRate ? [ successRate, (1 - successRate) ] : [ 1 ],
      [ successColor, errorColor ],
      successRate ? getColorFromStyles('base-100') : successColor,
      successRate ? '50%' : '100%',
    );
  },
  authenticationFunnel: (charts) => {
    const authenticationFunnel = charts[0].data;
    return doughnut(
      [ 'аутентификации', 'уходы' ],
      authenticationFunnel ? [ authenticationFunnel, (1 - authenticationFunnel) ] : [ 1 ],
      [ successColor, errorColor ],
      authenticationFunnel ? getColorFromStyles('base-100') : successColor,
      authenticationFunnel ? '50%' : '100%',
    );
  },
};
