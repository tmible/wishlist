import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import EditingModule from './editing/index.js';
import UsernamesModule from './usernames/index.js';
import WishlistModule from './wishlist/index.js';

/**
 * Обязательная часть элемента разметки текста
 * @typedef {object} EntityBase
 * @property {string} type Тип элемента
 * @property {number} offset Отступ от начала строки
 * @property {number} length Длина
 */
/**
 * Элемент разметки текста
 * @typedef {EntityBase & Record<string, unknown>} Entity
 */

/** @module Хранилище -- абстракция БД */

/**
 * Модули хранилища
 * @type {{ configure: Function } & Record<string, unknown>}
 */
const storeModules = [
  WishlistModule,
  EditingModule,
  UsernamesModule,
];

/**
 * Создание подключения к БД, [миграции БД]{@link migrate} и настройка модулей хранилища
 * @function initStore
 * @returns {() => void} Функция закрытия подключения к БД
 */
const initStore = () => {
  const db = new Database(process.env.WISHLIST_DB_FILE_PATH);
  migrate(db, process.env.WISHLIST_DB_MIGRATIONS_PATH);
  provide(InjectionToken.Database, db);
  storeModules.forEach(({ configure }) => configure());
  return () => db.close();
};

export default initStore;
