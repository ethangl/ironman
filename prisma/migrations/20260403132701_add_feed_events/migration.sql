-- CreateTable
CREATE TABLE "FeedEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streakId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT,
    "trackName" TEXT NOT NULL,
    "trackArtist" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedEvent_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "Streak" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FeedEvent_createdAt_idx" ON "FeedEvent"("createdAt");
