import { NextResponse } from "next/server";

import { getSongStats } from "@/lib/song-stats";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params;
  const stats = await getSongStats(trackId);

  if (!stats) {
    return NextResponse.json(
      { error: "Song not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(stats);
}
