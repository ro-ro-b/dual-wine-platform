import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = getDataProvider();
  const wines = await provider.listWines();
  return NextResponse.json(wines);
}

export async function POST(req: NextRequest) {
  try {
    const provider = getDataProvider();
    const body = await req.json();
    const wine = await provider.mintWine(body);
    return NextResponse.json(wine, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
