import { extractPalette } from "@/lib/palette";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");
  if (!imageUrl) return NextResponse.json([]);

  const colors = await extractPalette(imageUrl);
  return NextResponse.json(colors);
}
