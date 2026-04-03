import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.feedEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  return NextResponse.json(
    events.map((e) => ({
      id: e.id,
      type: e.type,
      detail: e.detail,
      trackName: e.trackName,
      trackArtist: e.trackArtist,
      userName: e.user.name,
      userImage: e.user.image,
      createdAt: e.createdAt.toISOString(),
    }))
  );
}
