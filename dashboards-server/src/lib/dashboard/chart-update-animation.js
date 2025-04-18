/** @typedef {import('chart.js').Chart} Chart */
/** @typedef {import('chart.js').ChartConfiguration} ChartConfiguration */

/** @module Анимации графиков в дашбордах */

/**
 * Критерий необходимости применения анимации при обновлении
 * @typedef {Pick<Chart, 'data' | 'options'>} PreviousState
 * @typedef {Pick<ChartConfiguration, 'data' | 'options'>} CurrentState
 * @typedef {(PreviousState, CurrentState) => boolean} ShouldAnimateCriteria
 */

/**
 * Определение необходимости применения анимации при обновлении дашборда с графиками в виде линий
 * @function line
 * @param {PreviousState} previousState Предыдущее состояние дашборда
 * @param {CurrentState} currentState Следующее состояние дашборда
 * @returns {boolean} Признак необходимости применения анимации
 */
const line = (previousState, currentState) => {
  const previousDatasetsLength = previousState.data.datasets[0]?.data.length ?? 0;
  const currentDatasetsLength = currentState.data.datasets[0]?.data.length ?? 0;
  return previousDatasetsLength === 0 && currentDatasetsLength > 0;
};

/**
 * Определение необходимости применения анимации при обновлении дашборда с графиком в виде кольца
 * @function doughnut
 * @param {PreviousState} previousState Предыдущее состояние дашборда
 * @param {CurrentState} currentState Следующее состояние дашборда
 * @returns {boolean} Признак необходимости применения анимации
 */
const doughnut = (
  previousState,
  currentState,
) => previousState.options?.cutout !== currentState.options?.cutout;

/**
 * Отображение типов дашбордов в критерии необходимости применения анимации при обновлении
 * @constant {{ [key: string]: ShouldAnimateCriteria}}
 */
export const ChartUpdateAnimation = {
  time: line,
  activeUsers: line,
  successRate: doughnut,
  authenticationFunnel: doughnut,
};
