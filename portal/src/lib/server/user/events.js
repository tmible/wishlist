/** @module События пользователя */

/**
 * Событие добавления
 * @constant {string}
 */
export const AddUser = 'add user';

/**
 * Событие получения хэша
 * @constant {string}
 */
export const GetUserHash = 'get user hash SERVER';

/**
 * Событие установки хэша
 * @constant {string}
 */
export const SetUserHash = 'set user hash';

/**
 * Событие сохранения refresh токена аутентификации
 * @constant {string}
 */
export const StoreRefreshToken = 'store refresh token';

/**
 * Событие получения refresh токена аутентификации
 * @constant {string}
 */
export const GetRefreshToken = 'get refresh token';

/**
 * Событие удаления refresh токена аутентификации
 * @constant {string}
 */
export const DeleteRefreshToken = 'delete refresh token';
