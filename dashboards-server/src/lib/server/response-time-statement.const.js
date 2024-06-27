import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами метрики времени, потраченного ботом с получения
 * обновления до отправки ответа пользователю, для каждого обновления в пределах указанного периода
 * @type {Statement}
 */
export let responseTimeStatement;

if (!building) {
  responseTimeStatement = db.prepare(`
    SELECT time, responseTime
    FROM (
      SELECT
        time,
        time - LAG(time, 1) OVER (PARTITION BY updateId ORDER BY time) AS responseTime
      FROM logs
      WHERE (msg = 'starting up' OR msg = 'update processed') AND time > ?
    )
    WHERE responseTime IS NOT NULL
  `);
}
