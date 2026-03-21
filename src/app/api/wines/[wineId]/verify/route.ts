import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { wineId: string } }) {
  try {
    const provider = getDataProvider();
    const wine = await provider.getWine(params.wineId);

    if (!wine) {
      return NextResponse.json(
        { error: "Wine not found", verified: false },
        { status: 404 }
      );
    }

    const isVerified = wine.status === "anchored" || (!!wine.contentHash && !!wine.blockchainTxHash);

    return NextResponse.json({
      verified: isVerified,
      wine,
      verificationStatus: isVerified ? "authentic" : "unverified",
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, verified: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { wineId: string } }) {
  try {
    const client = await getAuthenticatedClient();
    const provider = getDataProvider();
    const wine = await provider.getWine(params.wineId);

    if (!wine) {
      return NextResponse.json(
        { error: "Wine not found" },
        { status: 404 }
      );
    }

    // Execute verification action via ebus
    const result = await client?.ebus.execute({
      action: {
        custom: {
          type: "VERIFY",
          object_id: wine.objectId,
          data: {
            verifier: "third-party",
            timestamp: new Date().toISOString(),
          },
        },
      },
    });

    const isVerified = wine.status === "anchored" || (!!wine.contentHash && !!wine.blockchainTxHash);

    return NextResponse.json({
      success: true,
      verified: isVerified,
      verificationStatus: isVerified ? "authentic" : "unverified",
      wine,
      actionId: result?.action_id,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
