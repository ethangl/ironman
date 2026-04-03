-- CreateTable
CREATE TABLE "Weakness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streakId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Weakness_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "Streak" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Weakness_streakId_createdAt_idx" ON "Weakness"("streakId", "createdAt");
