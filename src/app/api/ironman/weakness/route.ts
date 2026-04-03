import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const { type, detail } = await req.json();

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) {
    return NextResponse.json({ error: "No active streak" }, { status: 404 });
  }

  const weakness = await prisma.weakness.create({
    data: {
      streakId: streak.id,
      type,
      detail: detail ?? null,
    },
  });

  return NextResponse.json({ id: weakness.id, type: weakness.type });
}

export async function GET() {
  const { session, error } = await getSessionOrUnauth();
  if (error) return error;

  const streak = await prisma.streak.findFirst({
    where: { userId: session!.user.id, active: true },
  });

  if (!streak) {
    return NextResponse.json([]);
  }

  const weaknesses = await prisma.weakness.findMany({
    where: { streakId: streak.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    weaknesses.map((w) => ({
      id: w.id,
      type: w.type,
      detail: w.detail,
      createdAt: w.createdAt.toISOString(),
    }))
  );
}
