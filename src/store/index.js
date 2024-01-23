import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import WishlistModule from './wishlist/index.js';
import EditingModule from './editing/index.js';
import UsernamesModule from './usernames/index.js';

export let db;

const migrate = async () => {
  const userVersion = db.pragma('user_version', { simple: true });
  const migrations = await readdir(process.env.WISHLIST_DB_MIGRATIONS_PATH);

  for (let i = userVersion + 1; i < migrations.length + 1; ++i) {
    db.transaction(async (migration) => {
      db.exec(await readFile(join(process.env.WISHLIST_DB_MIGRATIONS_PATH, migration), 'utf8'));
      db.pragma(`user_version = ${i}`);
    })(migrations[i - 1]);
  }
};

export const initStore = async () => {
  db = new Database(process.env.WISHLIST_DB_FILE_PATH);
  await migrate();
  [
    WishlistModule,
    EditingModule,
    UsernamesModule,
  ].forEach(({ configure }) => configure());
};

export const destroyStore = () => db.close();
