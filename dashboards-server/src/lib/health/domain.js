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
 * Информация о здоровье сервиса удаления протухших refresh токенов аутентификации на портале
 * @typedef {object} RefreshTokensCleanerHealthData
 * @property {boolean} timer Запущен ли systemd таймер
 * @property {boolean} service Запущен ли systemd сервис
 */
/**
 * Информация о проверке здоровья сервисов
 * @typedef {object} HealthData
 * @property {number} date Таймштамп проверки
 * @property {BotHealthData | null} bot Информация о здоровье бота
 * @property {PortalHealthData | null} portal Информация о здоровье портала
 * @property {HubHealthData | null} hub Информация о здоровье хаба
 * @property {RefreshTokensCleanerHealthData | null} refreshTokensCleaner
 * Информация о здоровье сервиса удаления протухших refresh токенов аутентификации на портале
 * @property {object | null} other Объединение всех сервисов, кроме бота и портала
 */

/**
 * Добавление объединения информации о сервисах, кроме бота и портала
 * @function addOtherService
 * @param {HealthData} health Информация о здороье сервисов
 * @returns {HealthData} Информация с добавленным объединением
 */
export const addOtherService = (health) => {
  health.other = {};
  for (const service of Object.entries(health)) {
    if (service[0] === 'bot' || service[0] === 'portal' || service[0] === 'other') {
      continue;
    }
    Object.assign(
      health.other,
      Object.fromEntries(
        Object.entries(service[1]).map(([ key, value ]) => [ `${service[0]}.${key}`, value ]),
      ),
    );
  }
  return health;
};
