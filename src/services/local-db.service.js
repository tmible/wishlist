import { ClassicLevel } from 'classic-level';

/** @module Сервис для доступа к локальной БД для горячих данных */

/**
 * Объект для доступа к БД
 * @type {ClassicLevel}
 */
let db;

/**
 * Инициализация объекта для доступа к БД
 * @function getLocalDB
 * @param {string} [sublevelName] Название запрашиваемой части БД
 * @returns {ClassicLevel} Объект для доступа к БД
 */
export const getLocalDB = (sublevelName) => {
  if (!db) {
    db = new ClassicLevel(process.env.LOCAL_DB_PATH, { valueEncoding: 'json' });
  }

  return sublevelName ? db.sublevel(sublevelName, { valueEncoding: 'json' }) : db;
};

/**
 * Закрытие [подключения к БД]{@link db}
 * @async
 * @function closeLocalDB
 */
export const closeLocalDB = () => db.close();
