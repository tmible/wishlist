import { readable } from 'svelte/store';
import { authInterceptor } from '$lib/auth-interceptor.js';

/** @typedef {import('svelte/store').Readable} Readable */
/**
 * Информация о здоровье бота
 * @typedef {object} BotHealthData
 * @property {boolean} service Запущен ли systemd сервис
 * @property {boolean} localhost Запущен ли http сервер
 * @property {boolean} https Проксируется ли https запрос к домену на http сервер
 * @property {boolean} dbConnection Подключен ли бот к БД
 * @property {boolean} localDBConnection Подключен ли бот к БД для горячих данных
 * @property {boolean} hubConnection Подключен ли бот к хабу
 */
/**
 * Информация о здоровье портала
 * @typedef {object} PortalHealthData
 * @property {boolean} service Запущен ли systemd сервис
 * @property {boolean} localhost Запущен ли http сервер
 * @property {boolean} https Проксируется ли https запрос к домену на http сервер
 * @property {boolean} dbConnection Подключен ли портал к БД
 * @property {boolean} hubConnection Подключен ли портал к хабу
 */
/**
 * Информация о здоровье хаба
 * @typedef {object} HubHealthData
 * @property {boolean} service Запущен ли systemd сервис
 * @property {boolean} socket Принимает ли хаб подключения к UNIX доменному сокету
 */
/**
 * Информация о проверке здоровья сервисов
 * @typedef {object} HealthData
 * @property {number} date Таймштамп проверки
 * @property {BotHealthData | null} bot Информация о здоровье бота
 * @property {PortalHealthData | null} portal Информация о здоровье портала
 * @property {HubHealthData | null} hub Информация о здоровье хаба
 */

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
);

/**
 * Svelte хранилище данных о проверке здоровья сервисов
 * @constant {Readable<HealthData>}
 */
export const healthData = readable(
  {
    date: null,
    bot: null,
    portal: null,
    hub: null,
  },
  (set) => {
    const timeout = setTimeout(async () => set(await fetchHealthData()));
    const interval = setInterval(async () => set(await fetchHealthData()), 60 * 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  },
);
