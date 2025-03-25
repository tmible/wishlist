import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {import('better-sqlite3').Database} Database */

/**
 * Миграции БД
 * @function migrate
 * @param {Database} db Объект для доступа к БД
 * @param {string} migrationsPath Путь к папке со скриптами миграции БД
 * @returns {void}
 */
const migrate = (db, migrationsPath) => {
  const userVersion = db.pragma('user_version', { simple: true });
  /* eslint-disable-next-line security/detect-non-literal-fs-filename --
    Имя папки хранится в переменной окружения, никакого пользовательского ввода --
    должно быть безопасно. Особенно с учётом того, что база данных, к которой применяются миграции,
    тоже локальная
  */
  const migrations = readdirSync(migrationsPath);

  for (let i = userVersion + 1; i < migrations.length + 1; ++i) {
    db.transaction((migration) => {
      db.exec(migration);
      db.pragma(`user_version = ${i}`);
    /* eslint-disable-next-line security/detect-non-literal-fs-filename --
      Имя папки хранится в переменной окружения, названия файлов читаются из неё же,
      никакого пользовательского ввода -- должно быть безопасно. Особенно с учётом того,
      что база данных, к которой применяются миграции, тоже локальная */
    })(readFileSync(join(migrationsPath, migrations[i - 1]), 'utf8'));
  }
};

export default migrate;
