import { DEFAULT_USER } from './default-user.const.js';

/** @module Домен пользователя */

/**
 * Пользователь
 * @typedef {object} User
 * @property {number | null} id Идентификатор пользователя
 * @property {string | null} hash Хэш пользователя
 * @property {boolean | null} isAuthenticated Признак аутентифицированности пользователя
 */

/**
 * Создание пользователя
 * @function createUser
 * @param {Partial<User>} initialData Инициализационные данные
 * @returns {User} Созданный пользователь
 */
export const createUser = (initialData) => ({
  ...DEFAULT_USER,
  ...initialData,
});

/**
 * Аутентификация пользователя
 * @function loginUser
 * @param {User} user Пользователь
 * @param {User['userid']} userid Идентификатор пользователя
 * @returns {User} Обновлённый пользователь
 */
export const loginUser = (user, userid) => {
  user.isAuthenticated = true;
  user.id = userid;
  return user;
};

/**
 * Разлогинивание пользователя
 * @function logoutUser
 * @param {User} user Пользователь
 * @returns {User} Обновлённый пользователь
 */
export const logoutUser = (user) => {
  user.isAuthenticated = false;
  user.id = null;
  user.hash = null;
  return user;
};

/**
 * Установка хэша пользователя
 * @function setUserHash
 * @param {User} user Пользователь
 * @param {User['hash']} hash Хэш пользователя
 * @returns {User} Обновлённый пользователь
 */
export const setUserHash = (user, hash) => {
  user.hash = hash;
  return user;
};
