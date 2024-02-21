/* eslint-disable import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import EditingModule from './editing/index.js';
import UsernamesModule from './usernames/index.js';
import WishlistModule from './wishlist/index.js';

/* eslint-enable import/no-cycle */

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
 * Объект для доступа к БД
 * @type {Database}
 */
export let db;

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
 * @returns {Promise<void>}
 * @async
 */
const migrate = async () => {
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
 * @returns {Promise<void>}
 * @async
 */
export const initStore = async () => {
  db = new Database(process.env.WISHLIST_DB_FILE_PATH);
  await migrate();
  storeModules.forEach(({ configure }) => configure());
};

/**
 * Закрытие подключения к БД
 * @function destroyStore
 * @returns {void}
 */
export const destroyStore = () => db.close();
