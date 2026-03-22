import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient, getJwtToken } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/test-transfer
 * Diagnostic: test every known transfer payload format against the gateway.
 * Uses objectId 69bf6b8ec90496da12892bdb (Chardonnay token).
 */
export async function GET(req: NextRequest) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const objectId = "69bf6b8ec90496da12892bdb";
    const ownerAddr = "0x2A976Bfa74Dd3212D93067708A32e3CE2bA58110";
    const email = "icbuswell@gmail.com";

    // --- Group A: /ebus/execute via SDK (action wrapper format) ---
    const ebusFormats = [
      // A1: ebus with recipientId (wallet address)
      { name: "ebus:id+recipientId(addr)", payload: { action: { transfer: { id: objectId, recipientId: ownerAddr } } } },
      // A2: ebus with recipientId (email)
      { name: "ebus:id+recipientId(email)", payload: { action: { transfer: { id: objectId, recipientId: email } } } },
      // A3: ebus with new_owner (wallet) — previously returned "invalid to address"
      { name: "ebus:id+new_owner(addr)", payload: { action: { transfer: { id: objectId, new_owner: ownerAddr } } } },
      // A4: ebus with new_owner (email)
      { name: "ebus:id+new_owner(email)", payload: { action: { transfer: { id: objectId, new_owner: email } } } },
      // A5: ebus with to (wallet)
      { name: "ebus:id+to(addr)", payload: { action: { transfer: { id: objectId, to: ownerAddr } } } },
    ];

    // --- Group B: /actions/execute format (per API reference) ---
    const actionsFormats = [
      // B1: actions/execute with recipientId (wallet)
      { name: "actions:recipientId(addr)", payload: { objectId, actionTypeId: "transfer", parameters: { recipientId: ownerAddr } } },
      // B2: actions/execute with recipientId (email)
      { name: "actions:recipientId(email)", payload: { objectId, actionTypeId: "transfer", parameters: { recipientId: email } } },
      // B3: actions/execute with new_owner (wallet)
      { name: "actions:new_owner(addr)", payload: { objectId, actionTypeId: "transfer", parameters: { new_owner: ownerAddr } } },
    ];

    const results: any[] = [];

    // Test Group A via SDK ebus.execute()
    for (const fmt of ebusFormats) {
      try {
        const result = await client.ebus.execute(fmt.payload);
        results.push({ format: fmt.name, success: true, result });
        // If one succeeds, still test the rest for completeness
      } catch (err: any) {
        results.push({
          format: fmt.name,
          error: err.body?.message || err.message || String(err),
          status: err.status,
          fullBody: err.body ? JSON.stringify(err.body).substring(0, 300) : undefined,
        });
      }
    }

    // Test Group B: raw fetch to /actions/execute
    // We need the base URL and token from the SDK config
    // The gateway base is https://gateway-48587430648.europe-west6.run.app
    const baseUrl = "https://gateway-48587430648.europe-west6.run.app";
    // Get the JWT token — need to extract it from the client
    // We'll use the auth helper to get a fresh token
    const jwt = getJwtToken();

    if (jwt) {
      for (const fmt of actionsFormats) {
        try {
          const res = await fetch(`${baseUrl}/actions/execute`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(fmt.payload),
          });
          const data = await res.json().catch(() => res.text());
          if (res.ok) {
            results.push({ format: fmt.name, success: true, result: data });
          } else {
            results.push({ format: fmt.name, error: typeof data === "string" ? data : data.message || data.error || JSON.stringify(data), status: res.status, fullBody: JSON.stringify(data).substring(0, 300) });
          }
        } catch (err: any) {
          results.push({ format: fmt.name, error: err.message, status: 0 });
        }
      }
    } else {
      results.push({ format: "actions:*", error: "Could not extract JWT for raw /actions/execute calls" });
    }

    return NextResponse.json({ results, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
