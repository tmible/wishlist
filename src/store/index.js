import { join } from 'node:path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

import './editing/index.js';
import './wishlist/index.js';
import './usernames/index.js';

export let db;

export const initStore = async () => {
  db = await open({
    filename: process.env.WISHLIST_DB_FILE_PATH,
    driver: sqlite3.Database,
  });

  await db.migrate({ migrationsPath: join(process.cwd(), 'db-migrations') });
};

export const destroyStore = () => db.close();
