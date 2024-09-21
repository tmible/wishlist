ALTER TABLE "list" ADD COLUMN "order" INTEGER CHECK("order" >= 0);

ALTER TABLE "list" DROP COLUMN "priority";

WITH "list_numbered" AS (
	SELECT "id", row_number() OVER (PARTITION BY "userid") - 1 AS "order" FROM "list"
)
UPDATE "list" SET "order" = (SELECT "order" FROM "list_numbered" WHERE "list_numbered"."id" = "list"."id");

CREATE TABLE "categories" (
	"id" INTEGER NOT NULL,
	"userid" INTEGER NOT NULL,
	"name" TEXT NOT NULL,
	FOREIGN KEY("userid") REFERENCES "usernames",
	PRIMARY KEY("id" ASC AUTOINCREMENT)
);

ALTER TABLE "list" ADD COLUMN "category_id" INTEGER REFERENCES "categories" ON DELETE SET NULL;
