CREATE TABLE "logs" (
	"level"	INTEGER NOT NULL,
	"time"	INTEGER NOT NULL,
	"pid"	INTEGER NOT NULL,
	"hostname"	TEXT NOT NULL,
	"chatId"	INTEGER NOT NULL,
	"userid"	INTEGER NOT NULL,
	"updateId"	INTEGER NOT NULL,
	"msg"	TEXT NOT NULL,
	"updateType"	TEXT,
	"updatePayload"	TEXT
);

PRAGMA journal_mode = WAL;
