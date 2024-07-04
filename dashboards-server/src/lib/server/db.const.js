import Database from 'better-sqlite3';
import { building } from '$app/environment';
import { LOGS_DB_FILE_PATH } from '$env/static/private';

/**
 * Объект для доступа к БД с логами
 * @type {Database}
 */
export let db;

if (!building) {
  db = new Database(LOGS_DB_FILE_PATH);
  process.on('sveltekit:shutdown', () => db.close());
}
