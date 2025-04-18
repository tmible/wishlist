import { PERIOD } from '$lib/constants/period.const.js';

/** @module Домен дашборда */

/**
 * Тип данных дашборда
 * @template T
 * @typedef {{ [chart: string]: undefined | null | T }} DashboardData
 */
/**
 * Базовый конфиг для построения дашборда
 * @template T
 * @typedef {object} DashboardConfigBase
 * @property {'line' | 'doughnut'} type Тип графиков дашборда
 * @property {PERIOD} [period] Период для отображения графиков
 * @property {DashboardData<T>} [initialData] Данные для инициализации дашборда
 */
/** @typedef {{ [label: string]: unknown, value: number }[]} LineDashboardData */
/**
 * Конфиг для построения дашборда с графиками в виде линий
 * @typedef {object} LineDashboardConfig
 * @property {'line'} type Тип графиков дашборда
 * @property {object} chartConfigs Конфиг грфиков
 * @property {string} chartConfigs.key Идентификатор графика
 * @property {string} chartConfigs.label Название графика для отображения
 * @property {boolean} [chartConfigs.isDisplayed] Признак отображения графика
 * @augments DashboardConfigBase<LineDashboardData>
 */
// eslint-disable-next-line no-secrets/no-secrets -- Название типа с шаблоном
/**
 * Конфиг для построения дашборда с графиком в виде кольца
 * @typedef {object} DoughnutDashboardConfig
 * @property {'doughnut'} type Тип графика дашборда
 * @property {string} key Идентификатор графика
 * @property {string} label Название графика для отображения
 * @augments DashboardConfigBase<number>
 */
/**
 * Конфиг для построения дашборда
 * @typedef {LineDashboardConfig | DoughnutDashboardConfig} DashboardConfig
 */

/**
 * Базовый дашборд
 * @template T
 * @typedef {object} DashboardBase
 * @property {PERIOD} period Период для отображения графиков
 * @property {DashboardData<T>} [initialData] Данные для инициализации дашборда
 */
/** @typedef {{ [label: string]: unknown, value: number }[]} LineDashboardData */
/**
 * Дашборд с графиками в виде линий
 * @typedef {object} LineDashboard
 * @property {
 *   Map<
 *     LineDashboardConfig['chartConfigs']['key'],
 *     {
 *       label: LineDashboardConfig['chartConfigs']['label'],
 *       isDisplayed: boolean,
 *       data: DashboardData<LineDashboardData>,
 *     }
 *   >
 * } charts Грфики дашборда
 * @augments DashboardBase<LineDashboardData>
 */
/**
 * Дашборд с графиком в виде кольца
 * @typedef {object} DoughnutDashboard
 * @property {
 *   Map<
 *     DoughnutDashboardConfig['key'],
 *     {
 *       label: DoughnutDashboardConfig['label'],
 *       isDisplayed: boolean,
 *       data: DashboardData<number>,
 *     }
 *   >
 * } charts Грфик дашборда
 * @augments DashboardBase<number>
 */
/**
 * Дашборд
 * @typedef {LineDashboard | DoughnutDashboard} Dashboard
 */

/**
 * Период для отображения графиков по умолчанию
 * @constant {PERIOD}
 */
const DEFAULT_PERIOD = PERIOD.DAY;

/**
 * Строители дашбордов с разными типами графиков
 * @constant {{
 *   [chartType: DashboardConfig['type']]: (
 *     dashboard: Dashboard,
 *     dashboardConfig: DashboardConfig,
 *   ) => void
 * }}
 */
const BUILDERS = {
  line: (dashboard, { chartConfigs }) => {
    dashboard.charts = new Map(chartConfigs.map(({ key, label, isDisplayed }, i) => [
      key,
      {
        label,
        isDisplayed: isDisplayed ?? i === 0,
        data: undefined,
      },
    ]));
  },
  doughnut: (dashboard, { key, label }) => {
    dashboard.charts = new Map([[
      key,
      {
        label,
        isDisplayed: true,
        data: undefined,
      },
    ]]);
  },
};

/**
 * Построение дашборда. Установка общих свойств и вызов строителя в соответствии с типом
 * @function buildDashboard
 * @param {DashboardConfig} dashboardConfig Конфиг дашборда
 * @returns {Dashboard} Построенный дашборд
 */
export const buildDashboard = ({
  period = DEFAULT_PERIOD,
  type,
  initialData = {},
  ...restConfig
}) => {
  const dashboard = { period, initialData };
  BUILDERS[type](dashboard, restConfig);
  return dashboard;
};
