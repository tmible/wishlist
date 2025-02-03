ALTER TABLE "logs" RENAME TO "bot.logs";

CREATE TABLE "portal.logs" (
  "level" INTEGER NOT NULL,
  "time" INTEGER NOT NULL,
  "pid" INTEGER NOT NULL,
  "hostname" TEXT NOT NULL,
  "requestUuid" TEXT,
  "unknownUserUuid" TEXT,
  "userid" INTEGER,
  "msg" TEXT NOT NULL
);

CREATE TABLE "portal.actions" (
  "timestamp" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "unknownUserUuid" TEXT NOT NULL
);
