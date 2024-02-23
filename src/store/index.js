import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { provide } from '@tmible/wishlist-bot/architecture/dependency-injector';
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
 * Миграции БД
 * @function migrate
 * @param {Database} db Объект для доступа к БД
 * @returns {Promise<void>}
 * @async
 */
const migrate = async (db) => {
  const userVersion = db.pragma('user_version', { simple: true });
  /* eslint-disable-next-line security/detect-non-literal-fs-filename --
    Имя папки хранится в переменной окружения, никакого пользовательского ввода --
    должно быть безопасно. Особенно с учётом того, что база данных, к которой применяются миграции
    тоже локальная
  */
  const migrations = await readdir(process.env.WISHLIST_DB_MIGRATIONS_PATH);

  for (let i = userVersion + 1; i < migrations.length + 1; ++i) {
    db.transaction(async (migration) => {
      /* eslint-disable-next-line security/detect-non-literal-fs-filename --
        Имя папки хранится в переменной окружения, названия файло читаются тз неё же,
        никакого пользовательского ввода -- должно быть безопасно. Особенно с учётом того,
        что база данных, к которой применяются миграции тоже локальная
      */
      db.exec(await readFile(join(process.env.WISHLIST_DB_MIGRATIONS_PATH, migration), 'utf8'));
      db.pragma(`user_version = ${i}`);
    })(migrations[i - 1]);
  }
};

/**
 * Создание подключения к БД, [миграции БД]{@link migrate} и настройка модулей хранилища
 * @function initStore
 * @returns {Promise<() => void>} Функция закрытия подключения к БД
 * @async
 */
const initStore = async () => {
  const db = new Database(process.env.WISHLIST_DB_FILE_PATH);
  await migrate(db);
  provide(InjectionToken.Database, db);
  storeModules.forEach(({ configure }) => configure());
  return () => db.close();
};

export default initStore;
