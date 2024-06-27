import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами метрики MAU для каждого дня указанного периода
 * @type {Statement}
 */
export let mauStatement;

if (!building) {
  mauStatement = db.prepare(`
    WITH RECURSIVE months(month_end, month_start, period_end, n, period_start) AS (
      SELECT $periodEnd / 1000, ? / 1000, $periodEnd / 1000, 1, $periodStart / 1000
      UNION ALL
      SELECT
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', 'utc'),
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', '-1 month', 'utc'),
        period_end,
        n + 1,
        period_start
      FROM months
      WHERE month_end > period_start
    )
    SELECT
      COUNT(DISTINCT userid) as mau,
      unixepoch(month_end, 'unixepoch') * 1000 AS date
    FROM months
    LEFT JOIN (SELECT time, userid FROM logs WHERE level = 30 AND msg = 'starting up') AS logs
    ON (logs.time / 1000 >= months.month_start AND logs.time / 1000 < months.month_end)
    GROUP BY month_end
  `);
}
