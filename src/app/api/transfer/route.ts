import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/transfer
 * Transfer a wine token to another wallet via /ebus/execute.
 * Body: { objectId, toAddress }
 */
export async function POST(req: NextRequest) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json(
        { error: "Not authenticated. Login first via /api/auth." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { objectId, toAddress } = body;

    if (!objectId || !toAddress) {
      return NextResponse.json(
        { error: "objectId and toAddress are required" },
        { status: 400 }
      );
    }

    // Execute transfer action via ebus
    // Gateway expects 'id' (not 'object_id') for the transfer target
    const actionPayload = {
      action: {
        transfer: {
          id: objectId,
          new_owner: toAddress,
        },
      },
    };

    const result = await client.ebus.execute(actionPayload);

    return NextResponse.json({
      success: true,
      actionId: result.action_id,
      steps: result.steps,
    }, { status: 200 });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.body?.message || err.message || "Transfer failed";
    return NextResponse.json({ error: message }, { status });
  }
}
