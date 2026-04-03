-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "trackArtist" TEXT NOT NULL,
    "trackImage" TEXT,
    "trackDuration" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "hardcore" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "lastProgressMs" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Streak" ("active", "count", "endedAt", "id", "lastCheckedAt", "lastProgressMs", "startedAt", "trackArtist", "trackDuration", "trackId", "trackImage", "trackName", "userId") SELECT "active", "count", "endedAt", "id", "lastCheckedAt", "lastProgressMs", "startedAt", "trackArtist", "trackDuration", "trackId", "trackImage", "trackName", "userId" FROM "Streak";
DROP TABLE "Streak";
ALTER TABLE "new_Streak" RENAME TO "Streak";
CREATE INDEX "Streak_trackId_count_idx" ON "Streak"("trackId", "count");
CREATE INDEX "Streak_userId_active_idx" ON "Streak"("userId", "active");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
