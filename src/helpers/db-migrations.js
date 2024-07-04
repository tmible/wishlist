import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** @typedef {import('better-sqlite3')} Database */

/**
 * Миграции БД
 * @function migrate
 * @param {Database} db Объект для доступа к БД
 * @param {string} migrationsPath Путь к папке со скриптами миграции БД
 * @returns {Promise<void>}
 * @async
 */
const migrate = async (db, migrationsPath) => {
  const userVersion = db.pragma('user_version', { simple: true });
  /* eslint-disable-next-line security/detect-non-literal-fs-filename --
    Имя папки хранится в переменной окружения, никакого пользовательского ввода --
    должно быть безопасно. Особенно с учётом того, что база данных, к которой применяются миграции
    тоже локальная
  */
  const migrations = await readdir(migrationsPath);

  for (let i = userVersion + 1; i < migrations.length + 1; ++i) {
    db.transaction(async (migration) => {
      /* eslint-disable-next-line security/detect-non-literal-fs-filename --
        Имя папки хранится в переменной окружения, названия файло читаются тз неё же,
        никакого пользовательского ввода -- должно быть безопасно. Особенно с учётом того,
        что база данных, к которой применяются миграции тоже локальная
      */
      db.exec(await readFile(join(migrationsPath, migration), 'utf8'));
      db.pragma(`user_version = ${i}`);
    })(migrations[i - 1]);
  }
};

export default migrate;
