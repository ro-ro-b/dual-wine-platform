import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { wineId: string } }) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const provider = getDataProvider();
    const wine = await provider.getWine(params.wineId);

    if (!wine) {
      return NextResponse.json({ error: "Wine not found" }, { status: 404 });
    }

    const body = await req.json();
    const { price } = body;

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Valid price required" }, { status: 400 });
    }

    // Execute listing action via ebus
    const result = await client.ebus.execute({
      action: {
        custom: {
          type: "LIST",
          object_id: wine.objectId,
          data: {
            listingPrice: price,
            listedAt: new Date().toISOString(),
          },
        },
      },
    });

    // Update wine status to 'listed'
    await provider.updateWineStatus(params.wineId, "listed");

    return NextResponse.json(
      {
        success: true,
        actionId: result?.action_id,
        wine: { ...wine, status: "listed", listedPrice: price },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
