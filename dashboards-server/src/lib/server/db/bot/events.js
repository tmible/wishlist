/** @module События адаптера БД для бота */

/**
 * Получение времени ответа
 * @constant {string}
 */
export const GetResponseTime = 'get bot response time';

/**
 * Получение времени обработки обновления
 * @constant {string}
 */
export const GetProcessTime = 'get bot process time';

/**
 * Получение времени подотовки к обработке обновления
 * @constant {string}
 */
export const GetStartupTime = 'get bot startup time';

/**
 * Получение количества активных пользователей за день
 * @constant {string}
 */
export const GetDAU = 'get bot DAU';

/**
 * Получение количества активных пользователей за месяц
 * @constant {string}
 */
export const GetMAU = 'get bot MAU';

/**
 * Получение количества активных пользователей за год
 * @constant {string}
 */
export const GetYAU = 'get bot YAU';

/**
 * Получение доли успешно обработанных обновлений
 * @constant {string}
 */
export const GetSuccessRate = 'get bot success rate';

/**
 * Получение всех полученных обновлений
 * @constant {string}
 */
export const GetUserSessions = 'get bot user sessions';
