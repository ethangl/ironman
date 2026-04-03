import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const trackId = req.nextUrl.searchParams.get("trackId");
  if (!trackId) {
    return NextResponse.json({ error: "Missing trackId" }, { status: 400 });
  }

  const fellows = await prisma.streak.findMany({
    where: {
      trackId,
      active: true,
      userId: { not: session!.user.id },
    },
    orderBy: { count: "desc" },
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  return NextResponse.json(
    fellows.map((s) => ({
      id: s.id,
      count: s.count,
      startedAt: s.startedAt.toISOString(),
      userName: s.user.name,
      userImage: s.user.image,
    }))
  );
}
