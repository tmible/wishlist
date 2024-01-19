CREATE TABLE "list" (
	"id"	INTEGER,
	"priority"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"description"	TEXT NOT NULL,
	"state"	INTEGER NOT NULL CHECK("state" IN (0, 1, 2)),
	PRIMARY KEY("id" ASC AUTOINCREMENT)
);

CREATE TABLE "participants" (
	"list_item_id"	INTEGER NOT NULL,
	"username"	TEXT NOT NULL,
	FOREIGN KEY("list_item_id") REFERENCES "list",
	UNIQUE("list_item_id","username")
);
