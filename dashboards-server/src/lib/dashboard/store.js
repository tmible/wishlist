/** @typedef {import('svelte/store').Readable} Readable */
/** @typedef {import('$lib/constants/period.const.js').PERIOD} PERIOD */
/** @typedef {import('./domain.js').Dashboard} Dashboard */
/** @typedef {import('./domain.js').DashboardData} DashboardData */

/** @module Адаптер хранилища дашборда */

/**
 * Хранилище дашборда
 * @typedef {object} Store
 * @implements {Readable<Dashboard>}
 * @property {(period: PERIOD) => void} updatePeriod Метод обновления периода
 * @property {(displayedCharts: { value: string }) => Promise<void>} updateChartsSelection
 *   Метод обновления выбранных графиков
 */

/**
 * Период автоматического обновления дашборда в милисекундах
 * @constant {number}
 */
const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000;

/**
 * Создание хранилища дашборда
 * @param {Dashboard} initialValue Изначальные данные для графиков
 * @param {(chartKeys: string[], periodStart: number) => Promise<DashboardData<unknown>>} fetchData
 *   Функция получения данных для графиков
 * @returns {Store} Хранилище
 */
// eslint-disable-next-line max-lines-per-function -- много отдельных функций в общем контексте
export const createStore = (initialValue, fetchData) => {
  /**
   * Значение хранилища
   * @type {Dashboard}
   */
  const value = initialValue;

  /**
   * Подписчики хранилища
   * @template [S=(value: any) => void]
   * @type {Map<S, S>}
   * @see {@link https://svelte.dev/docs/svelte/stores#Store-contract}
   */
  const subscriptions = new Map();

  /**
   * Кэш для данных графиков с другим периодом. Сохраняет данные при выборе другого периода.
   * Очищается при очередном запросе данных в рамках автоматического обновления
   * @type {Map<PERIOD, [ string, number ]>}
   */
  const cache = new Map();

  /**
   * Таймаут запроса данных
   * @type {ReturnType<typeof setTimeout>}
   */
  let timeout;

  /**
   * Интервал запроса данных
   * @type {ReturnType<typeof setInterval>}
   */
  let interval;

  /* eslint-disable no-secrets/no-secrets -- просто длинное название */

  /**
   * Обновление данных графиков и оповещение подписчиков
   * @function updateChartsAndNotifySubscribers
   * @param {[ string, number ][]} data Пары идентификаторов и данных графиков
   * @returns {void}
   */
  /* eslint-enable no-secrets/no-secrets */
  const updateChartsAndNotifySubscribers = (data) => {
    for (const [ key, datum ] of data) {
      value.charts.get(key).data = datum;
    }
    for (const subscription of subscriptions.values()) {
      subscription(value);
    }
  };

  /**
   * [Получение данных для указанных графиков за актуальный период]{@link fetchData}.
   * Сохранение полученных значений, оповещение подпсчиков
   * @function fetcher
   * @param {string[]} keys Идентификаторы графиков, данные для которых нужно запросить.
   *   По умолчанию — все отображаемые графики
   * @returns {Promise<void>}
   * @async
   */
  const fetcher = async (
    keys = Array.from(value.charts.entries())
      .filter(([ , { isDisplayed }]) => isDisplayed)
      .map(([ key ]) => key),
  ) => {
    if (keys.length === 0) {
      return;
    }
    const data = await fetchData(keys, Date.now() - value.period);
    updateChartsAndNotifySubscribers(data.map((datum, i) => [ keys[i], datum ]));
  };

  /**
   * Инвалидация [кэша]{@link cache} и [обновление данных в хранилище]{@link fetcher}
   * @function updater
   * @param {unknown[]} args Проксируемые fetcher параметры
   * @returns {Promise<ReturnType<typeof fetcher>>} Возвращаемое из fetcher значение
   * @async
   */
  const updater = async (...args) => {
    cache.clear();
    return await fetcher(...args);
  };

  /**
   * Запуск или перезапуск автоматического обновления данных
   * @param {string[]} initialKeys Идентификаторы графиков для первого запроса данных
   * @returns {void}
   */
  const restartPolling = (initialKeys) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (interval) {
      clearInterval(interval);
    }

    timeout = setTimeout(() => fetcher(initialKeys));
    interval = setInterval(updater, AUTO_UPDATE_INTERVAL);
  };

  /**
   * Сбор идентификаторов отображаемых графиков, для которых нет данных
   * @function collectNoDataCharts
   * @returns {string[]} Идентификаторы графиков
   */
  const collectNoDataCharts = () => {
    const noData = [];
    for (const [chartKey, chart] of value.charts.entries()) {
      if (chart.isDisplayed && chart.data === undefined) {
        noData.push(chartKey);
      }
    }
    return noData;
  };

  return {
    /**
     * Подписка на хранилище. Немедленный вызов функции-подписчика,
     * [сохранение подписки]{@link subscriptions}.
     * 1. При увеличении числа подписчиков с 0 до 1 — проверка наличия
     *    изначальных данных для графиков.
     * 1.1. При наличии изначальных данных — их установка, удаление изначальных данных,
     *      и [запуск автоматического обновления данных]{@link restartPolling}
     *      с первым запросом только за [недостающими данными]{@link collectNoDataCharts}.
     * 1.2. При отсутствии — [запуск автоматического обновления данных]{@link restartPolling}
     *      с параметрами по умолчанию.
     * 2. При уменьшении числа подписчиков с 1 до 0 — остановка автоматического обновления данных
     * @function subscribe
     * @param {(value: any) => void} subscription Функция-подписчик
     * @returns {() => void} Функция отписки
     * @see {@link https://svelte.dev/docs/svelte/stores#Store-contract}
     */
    subscribe: (subscription) => {
      subscription(value);
      subscriptions.set(subscription, subscription);

      if (subscriptions.size === 1) {
        if (Object.hasOwn(value, 'initialData')) {
          for (const [chartKey, chart] of value.charts.entries()) {
            if (Object.hasOwn(value.initialData, chartKey)) {
              chart.data = value.initialData[chartKey];
            }
          }
          restartPolling(collectNoDataCharts());
          delete value.initialData;
        } else {
          restartPolling();
        }
      }

      return () => {
        subscriptions.delete(subscription);

        if (subscriptions.size === 0) {
          clearTimeout(timeout);
          clearInterval(interval);
        }
      };
    },

    /**
     * Выбор нового периода для отображения графиков
     * 1. Сохранение в кэш данных для актуального преиода.
     * 2. Проверка наличия в кэше даннхы для выбравнного периода.
     * 2.1. При отсутствии — [перезапуск автоматического обновления данных]{@link restartPolling}.
     * 2.2. При наличии — установка значений из кэша и оповещение подписчиков.
     * @function updatePeriod
     * @param {PERIOD} period Новый выбранный период
     * @returns {void}
     */
    updatePeriod: (period) => {
      if (period && period !== value.period) {
        cache.set(
          value.period,
          Array.from(value.charts.entries(), ([ key, { data } ]) => [ key, data ]),
        );
        value.period = period;
      }
      const cached = cache.get(period);
      if (cached === undefined) {
        restartPolling();
      } else {
        updateChartsAndNotifySubscribers(cached);
      }
    },

    /**
     * Выбор графиков для отображения
     * Обновление признака отображения графиков,
     * [запрос]{@link fetcher} [недостающих данных]{@link collectNoDataCharts}
     * @function updateChartsSelection
     * @param {{ value: string }[]} displayedCharts
     *   Идентификаторы выбранных для отображения графиков
     * @returns {Promise<void>}
     * @async
     */
    updateChartsSelection: async (displayedCharts) => {
      for (const [chartKey, chart] of value.charts.entries()) {
        chart.isDisplayed = !!displayedCharts.some(({ value }) => value === chartKey);
      }
      await fetcher(collectNoDataCharts());
    },
  };
};
