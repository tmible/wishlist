import 'dotenv/config';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
  filename: process.env.WISHLIST_DB_FILE_PATH,
  driver: sqlite3.Database,
});

// await db.run('DROP TABLE participants');
// await db.run('DROP TABLE list')

await db.run(`CREATE TABLE list (
  id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT "" NOT NULL,
  state INTEGER CHECK (state IN (0, 1, 2)) NOT NULL
)`);
await db.run(`CREATE TABLE participants (
  listItemId INTEGER REFERENCES list NOT NULL,
  username TEXT NOT NULL,
  UNIQUE(listItemId, username)
)`);

// await db.run(`INSERT INTO list(name, description, state) VALUES
//   (
//     "Футболка Тарантино",
//     "Того самого жёлтого цвета типа как [тут](https://ae01.alicdn.com/kf/HTB14z3fdqmWBuNjy1Xaq6xCbXXaw.jpg)",
//     0
//   ),
//   (
//     "Чайник\\-лягушка",
//     "[Эх, жабы, мои жабы 💚](https://gagaru.club/uploads/posts/2023-05/1685382973_gagaru-club-p-chainik-lyagushka-krasivo-instagram-6.jpg)",
//     0
//   ),
//   (
//     "Настолка «Битва пяти воинств»",
//     "",
//     0
//   ),
//   (
//     "Маленькая сумка",
//     "Какая угодно",
//     0
//   ),
//   (
//     "Наушники",
//     "Ещё не выбрал\\!",
//     0
//   ),
//   (
//     "Очиститель воздуха",
//     "Какой угодно, главное, чтобы у меня пылищи в квартире меньше стало",
//     0
//   )
// `);

await db.close();
