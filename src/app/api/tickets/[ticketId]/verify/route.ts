import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const result = await client.ebus.execute({
      action: {
        custom: {
          name: "verify_ticket",
          object_id: params.ticketId,
          data: {
            custom: {
              ticketStatus: "scanned",
              verifiedAt: new Date().toISOString(),
              verifiedBy: "venue_scanner",
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      actionId: result.action_id,
      verified: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: err.status || 500 });
  }
}
