import Database from 'better-sqlite3';
import build from 'pino-abstract-transport';

/** @typedef {import('node:stream').Transform} Transform */

/**
 * Открытие подключения к БД, подготовка SQL выражения для добавления сообщения лога в БД,
 * создание функции, добавляющей сообщения в БД и закрытие подключения к БД при завершении работы
 * воркера
 * @function
 * @returns {Transform} Поток для записи лога в БД
 */
export default () => {
  const db = new Database(process.env.LOGS_DB_FILE_PATH);
  const statement = db.prepare(`
    INSERT INTO logs (
      level,
      time,
      pid,
      hostname,
      chatId,
      userid,
      updateId,
      msg,
      updateType,
      updatePayload
    )
    VALUES (
      $level,
      $time,
      $pid,
      $hostname,
      $chatId,
      $userid,
      $updateId,
      $msg,
      $updateType,
      $updatePayload
    )
  `);

  return build(
    async (source) => {
      for await (const obj of source) {
        statement.run({
          updateType: null,
          updatePayload: null,
          ...obj,
        });
      }
    },
    { close: () => Promise.resolve(db.close()) },
  );
};
