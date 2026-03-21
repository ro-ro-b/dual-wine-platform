import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = getDataProvider();
  const wines = await provider.listWines();
  return NextResponse.json(wines);
}

export async function POST(req: NextRequest) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json(
        { error: "Not authenticated. Login via admin to mint." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const templateId = process.env.DUAL_TEMPLATE_ID || '';

    // Mint via /ebus/execute
    const result = await client.ebus.execute({
      action: {
        mint: {
          template_id: templateId,
          num: 1,
          data: body, // pass wine form data as custom object data
        },
      },
    });

    const objectIds = result.steps?.[0]?.output?.ids || [];

    return NextResponse.json({
      success: true,
      actionId: result.action_id,
      objectIds,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
