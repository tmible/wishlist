import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами метрики времени, потраченного ботом с получения
 * обновления до начала его обработки, для каждого обновления в пределах указанного периода
 * @type {Statement}
 */
export let startupTimeStatement;

if (!building) {
  startupTimeStatement = db.prepare(`
    SELECT time, startupTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS startupTime
      FROM logs
      WHERE (msg = 'starting up' OR msg = 'start processing update') AND time > ?
    )
    WHERE startupTime IS NOT NULL
  `);
}
