import 'dotenv/config';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
  filename: process.env.WISHLIST_DB_FILE_PATH,
  driver: sqlite3.Database,
});

await db.run(`CREATE TABLE list (
  id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
  priority INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT "" NOT NULL,
  description_entities TEXT,
  state INTEGER CHECK (state IN (0, 1, 2)) NOT NULL
)`);
await db.run(`CREATE TABLE participants (
  listItemId INTEGER REFERENCES list NOT NULL,
  username TEXT NOT NULL,
  UNIQUE(listItemId, username)
)`);

await db.close();
