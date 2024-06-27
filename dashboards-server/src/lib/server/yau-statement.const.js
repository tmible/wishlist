import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами метрики YAU для каждого дня указанного периода
 * @type {Statement}
 */
export let yauStatement;

if (!building) {
  yauStatement = db.prepare(`
    WITH RECURSIVE years(year_end, year_start, period_end, n, period_start) AS (
      SELECT $periodEnd / 1000, ? / 1000, $periodEnd / 1000, 1, $periodStart / 1000
      UNION ALL
      SELECT
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', 'utc'),
        unixepoch(period_end, 'unixepoch', '-' || n || ' day', '-1 year', 'utc'),
        period_end,
        n + 1,
        period_start
      FROM years
      WHERE year_end > period_start
    )
    SELECT
      COUNT(DISTINCT userid) as yau,
      unixepoch(year_end, 'unixepoch') * 1000 AS date
    FROM years
    LEFT JOIN (SELECT time, userid FROM logs WHERE level = 30 AND msg = 'starting up') AS logs
    ON (logs.time / 1000 >= years.year_start AND logs.time / 1000 < years.year_end)
    GROUP BY year_end
  `);
}
