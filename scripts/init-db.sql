CREATE TABLE "list" (
  "id"	INTEGER,
  "username"	TEXT,
  "priority"	INTEGER NOT NULL,
  "name"	TEXT NOT NULL,
  "description"	TEXT NOT NULL,
  "state"	INTEGER NOT NULL CHECK("state" IN (0, 1, 2)),
  PRIMARY KEY("id" ASC AUTOINCREMENT)
)

CREATE TABLE "participants" (
  "list_item_id"	INTEGER NOT NULL,
  "username"	TEXT NOT NULL,
  UNIQUE("list_item_id","username"),
  FOREIGN KEY("list_item_id") REFERENCES "list"
)

CREATE TABLE "description_entities" (
  "list_item_id"	INTEGER NOT NULL,
  "type"	TEXT NOT NULL,
  "offset"	INTEGER NOT NULL,
  "length"	INTEGER NOT NULL,
  "additional"	TEXT,
  FOREIGN KEY("list_item_id") REFERENCES "list" ON DELETE CASCADE
)
