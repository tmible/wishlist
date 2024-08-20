DELETE FROM "list";

ALTER TABLE "list" ADD COLUMN "userid" INTEGER NOT NULL;

DROP TABLE "participants";

CREATE TABLE "participants" (
	"list_item_id"	INTEGER NOT NULL,
	"userid"	INTEGER NOT NULL,
	FOREIGN KEY("list_item_id") REFERENCES "list",
	UNIQUE("list_item_id", "userid") ON CONFLICT IGNORE
);

CREATE TABLE "description_entities" (
	"list_item_id"	INTEGER NOT NULL,
	"type"	TEXT NOT NULL,
	"offset"	INTEGER NOT NULL,
	"length"	INTEGER NOT NULL,
	"additional"	TEXT,
	FOREIGN KEY("list_item_id") REFERENCES "list" ON DELETE CASCADE
);

CREATE TABLE "usernames" (
	"userid"	INTEGER NOT NULL PRIMARY KEY ON CONFLICT REPLACE,
	"username"	TEXT
);
