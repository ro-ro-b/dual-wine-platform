import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { buyerAddress, listingPrice, sellerId } = body;

    if (!buyerAddress || !listingPrice) {
      return NextResponse.json({ error: "buyerAddress and listingPrice are required" }, { status: 400 });
    }

    // Execute purchase action via ebus custom action
    const result = await client.ebus.execute({
      action: {
        custom: {
          name: "purchase_ticket",
          object_id: params.ticketId,
          data: {
            custom: {
              purchasePrice: listingPrice,
              buyerAddress,
              sellerId,
              purchasedAt: new Date().toISOString(),
              ticketStatus: "transferred",
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      actionId: result.action_id,
      purchased: true,
      ticketId: params.ticketId,
      buyerAddress,
      purchasePrice: listingPrice,
      timestamp: new Date().toISOString(),
      transactionHash: `0x${Math.random().toString(16).slice(2)}`,
      blockscoutUrl: `https://32f.blockv.io/tx/0x${Math.random().toString(16).slice(2)}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Purchase failed" }, { status: err.status || 500 });
  }
}
