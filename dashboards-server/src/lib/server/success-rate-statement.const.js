import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами метрики доли успешно
 * обработанных ботом обновлений в пределах указанного периода
 * @type {Statement}
 */
export let successRateStatement;

if (!building) {
  successRateStatement = db.prepare(`
    WITH
    starts AS (
      SELECT updateId FROM logs WHERE level = 30 AND msg = 'starting up' AND time > $periodStart
    ),
    errors AS (
      SELECT updateId FROM logs WHERE level = 50 AND time > $periodStart
    )
    SELECT
      SUM(CASE WHEN errors.updateId IS NULL THEN 1 ELSE 0 END) AS successful,
      COUNT (*) total
    FROM starts
    LEFT JOIN errors
    ON starts.updateId = errors.updateId
  `);
}
