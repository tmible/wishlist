import { readable } from 'svelte/store';
import { authInterceptor } from '$lib/auth-interceptor.js';
import { addOtherService } from './domain.js';

/** @typedef {import('svelte/store').Readable} Readable */
/** @typedef {import('./domain.js').HealthData} HealthData */

/**
 * Период автоматического обновления хранилища
 * @constant {number}
 */
const AUTO_UPDATE_PERIOD = 60 * 1000;

/**
 * Запрос данных о результатах последней проверки здоровья сервисов
 * @function fetchHealthData
 * @returns {Promise<HealthData>} Данные о результатах последней проверки здоровья сервисов
 * @async
 */
const fetchHealthData = async () => await fetch(
  '/api/data/health',
).then(
  authInterceptor,
).then(
  (response) => response.json(),
).then(
  addOtherService,
);

/**
 * Svelte хранилище данных о проверке здоровья сервисов
 * @constant {Readable<HealthData>}
 */
export const health = readable(
  {
    date: null,
    bot: null,
    portal: null,
    hub: null,
    refreshTokensCleaner: null,
    other: null,
  },
  (set) => {
    const timeout = setTimeout(async () => set(await fetchHealthData()));
    const interval = setInterval(async () => set(await fetchHealthData()), AUTO_UPDATE_PERIOD);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  },
);
