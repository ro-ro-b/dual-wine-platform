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
    const { recipientEmail } = body;

    if (!recipientEmail) {
      return NextResponse.json({ error: "recipientEmail is required" }, { status: 400 });
    }

    const result = await client.ebus.execute({
      action: {
        transfer: {
          object_id: params.ticketId,
          new_owner: recipientEmail,
        },
      },
    });

    return NextResponse.json({
      success: true,
      actionId: result.action_id,
      transferredTo: recipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Transfer failed" }, { status: err.status || 500 });
  }
}
