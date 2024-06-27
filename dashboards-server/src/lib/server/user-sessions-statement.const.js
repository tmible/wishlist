import { building } from '$app/environment';
import { db } from './db.const.js';

/** @typedef {import('better-sqlite3').Statement} Statement */

/**
 * SQL выражение для получения из БД с логами всех полученных ботом обновлений
 * @type {Statement}
 */
export let userSessionsStatement;

if (!building) {
  userSessionsStatement = db.prepare(`
    SELECT time, chatId, userid, updateType, updatePayload
    FROM logs
    WHERE level = 30 AND msg = 'start processing update'
    ORDER BY time DESC
  `);
}
