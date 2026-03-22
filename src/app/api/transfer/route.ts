import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient, getJwtToken } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_DUAL_API_URL || "https://gateway-48587430648.europe-west6.run.app";

/**
 * POST /api/transfer
 * Transfer a wine token to another user.
 * Body: { objectId, toAddress }
 * toAddress can be: wallet address (0x...) or email
 *
 * Tries multiple API formats:
 * 1. POST /actions/execute { objectId, actionTypeId, parameters: { recipientId } }  (API ref)
 * 2. POST /ebus/execute { action: { transfer: { id, recipientId } } }
 * 3. POST /ebus/execute { action: { transfer: { id, new_owner } } }
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

    const errors: string[] = [];

    // ─── Attempt 1: /actions/execute (per DUAL API reference) ───
    const jwt = getJwtToken();
    if (jwt) {
      try {
        const res = await fetch(`${BASE_URL}/actions/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            objectId,
            actionTypeId: "transfer",
            parameters: { recipientId: toAddress },
          }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          return NextResponse.json({
            success: true,
            actionId: data.actionId || data.action_id,
            result: data,
          });
        }
        errors.push(`actions/execute: ${data?.message || data?.error || res.status}`);
      } catch (e: any) {
        errors.push(`actions/execute: ${e.message}`);
      }
    }

    // ─── Attempt 2: /ebus/execute with recipientId ───
    try {
      const result = await client.ebus.execute({
        action: { transfer: { id: objectId, recipientId: toAddress } },
      });
      return NextResponse.json({
        success: true,
        actionId: result.action_id || result.actionId,
        steps: result.steps,
      });
    } catch (e: any) {
      errors.push(`ebus+recipientId: ${e.body?.message || e.message}`);
    }

    // ─── Attempt 3: /ebus/execute with new_owner ───
    try {
      const result = await client.ebus.execute({
        action: { transfer: { id: objectId, new_owner: toAddress } },
      });
      return NextResponse.json({
        success: true,
        actionId: result.action_id || result.actionId,
        steps: result.steps,
      });
    } catch (e: any) {
      errors.push(`ebus+new_owner: ${e.body?.message || e.message}`);
    }

    // All attempts failed
    return NextResponse.json(
      { error: `All transfer formats failed: ${errors.join(" | ")}` },
      { status: 502 }
    );
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.body?.message || err.message || "Transfer failed";
    return NextResponse.json({ error: message }, { status });
  }
}
