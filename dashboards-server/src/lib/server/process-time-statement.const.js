import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами метрики времени, потраченного ботом с получения
 * обновления до завершения его обработки, для каждого обновления в пределах указанного периода
 * @type {Statement}
 */
export let processTimeStatement;

if (!building) {
  processTimeStatement = db.prepare(`
    SELECT time, processTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS processTime
      FROM logs
      WHERE (msg = 'starting up' OR msg = 'finished clean up') AND time > ?
    )
    WHERE processTime IS NOT NULL
  `);
}
