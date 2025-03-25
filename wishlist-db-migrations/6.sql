CREATE TABLE "refresh_tokens" (
  "token" TEXT NOT NULL,
  "userid" TEXT NOT NULL,
  "unknownUserUuid" TEXT NOT NULL,
  "expires" INTEGER NOT NULL,
  PRIMARY KEY("token"),
  FOREIGN KEY("userid") REFERENCES "usernames" ON DELETE CASCADE,
  UNIQUE("userid", "unknownUserUuid")
);
