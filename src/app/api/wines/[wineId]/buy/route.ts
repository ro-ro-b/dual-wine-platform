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

    if (wine.status !== "listed") {
      return NextResponse.json(
        { error: "Wine is not listed for sale" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { buyer, price } = body;

    if (!buyer || !price) {
      return NextResponse.json({ error: "Buyer and price required" }, { status: 400 });
    }

    // Execute purchase/transfer action via ebus
    const result = await client.ebus.execute({
      action: {
        custom: {
          type: "PURCHASE",
          object_id: wine.objectId,
          data: {
            buyer,
            purchasePrice: price,
            purchasedAt: new Date().toISOString(),
            previousOwner: wine.ownerId,
          },
        },
      },
    });

    // Update wine status to 'sold'
    await provider.updateWineStatus(params.wineId, "sold");

    return NextResponse.json(
      {
        success: true,
        actionId: result?.action_id,
        wine: { ...wine, status: "sold", ownerId: buyer },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
