import migrate from '@tmible/wishlist-common/db-migrations';
import Database from 'better-sqlite3';
import build from 'pino-abstract-transport';

/** @typedef {import('node:stream').Transform} Transform */

/**
 * Открытие подключения к БД, подготовка SQL выражения для добавления сообщения лога в БД,
 * создание функции, добавляющей сообщения в БД и закрытие подключения к БД при завершении работы
 * воркера
 * @function
 * @returns {Promise<Transform>} Поток для записи лога в БД
 * @async
 */
/* eslint-disable-next-line unicorn/no-anonymous-default-export -- Функция нигде статически
  не импортируется и используется только самим pino */
export default async () => {
  const db = new Database(process.env.LOGS_DB_FILE_PATH);
  await migrate(db, process.env.LOGS_DB_MIGRATIONS_PATH);
  const statement = db.prepare(`
    INSERT INTO "portal.logs" (
      level,
      time,
      pid,
      hostname,
      requestUuid,
      unknownUserUuid,
      userid,
      msg
    )
    VALUES (
      $level,
      $time,
      $pid,
      $hostname,
      $requestUuid,
      $unknownUserUuid,
      $userid,
      $msg
    )
  `);

  return build(
    async (source) => {
      for await (const obj of source) {
        statement.run({
          requestUuid: null,
          unknownUserUuid: null,
          userid: null,
          ...obj,
        });
      }
    },
    { close: () => Promise.resolve(db.close()) },
  );
};
