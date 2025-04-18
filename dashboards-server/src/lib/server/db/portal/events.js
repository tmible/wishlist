/** @module События адаптера БД для портала */

/**
 * Получение времени ответа
 * @constant {string}
 */
export const GetResponseTime = 'get portal response time';

/**
 * Получение количества активных пользователей за день
 * @constant {string}
 */
export const GetDAU = 'get portal DAU';

/**
 * Получение количества активных пользователей за месяц
 * @constant {string}
 */
export const GetMAU = 'get portal MAU';

/**
 * Получение количества активных пользователей за год
 * @constant {string}
 */
export const GetYAU = 'get portal YAU';

/**
 * Получение доли успешно обработанных серверной частью запросов
 * @constant {string}
 */
export const GetSuccessRate = 'get portal success rate';

/**
 * Получение доли пользователей, прошедших аутентификацию после посещения лендинга
 * @constant {string}
 */
export const GetAuthenticationFunnel = 'get portal authentication funnel';
