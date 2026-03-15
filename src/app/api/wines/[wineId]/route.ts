import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";

export async function GET(_req: NextRequest, { params }: { params: { wineId: string } }) {
  const provider = getDataProvider();
  const wine = await provider.getWine(params.wineId);
  if (!wine) return NextResponse.json({ error: "Wine not found" }, { status: 404 });
  return NextResponse.json(wine);
}
