import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-provider";
import { getAuthenticatedClient } from "@/lib/dual-auth";
import type { Wine } from "@/types/dual";

export const dynamic = "force-dynamic";

// Synthetic video showcase token — minted as a DUAL demo asset
const VIDEO_SHOWCASE_TOKEN: Wine = {
  id: "dual-showcase-video-001",
  templateId: "showcase-template",
  objectId: "0xDUAL-SHOWCASE-VIDEO-2026-001",
  contentHash: "0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  wineData: {
    name: "DUAL Wine Vault — Genesis Showcase",
    producer: "DUAL Protocol",
    region: "Digital",
    country: "Decentralized",
    vintage: 2026,
    varietal: "Video NFT",
    type: "red",
    abv: 0,
    volume: "12s / 1080p",
    quantity: 1,
    condition: "pristine",
    storage: "professional",
    drinkingWindow: { from: 2026, to: 2126 },
    ratings: [],
    certifications: ["AI-Generated", "Genesis Collection"],
    currentValue: 1,
    purchasePrice: 0,
    description: "The inaugural DUAL Wine Vault showcase — a cinematic AI-generated video exploring tokenised provenance, on-chain verification, and the editorial wine collection. Minted as the first video asset on the DUAL Network.",
    tastingNotes: {
      nose: "Notes of dark editorial surfaces, hints of gold accent, with a persistent blockchain undertone.",
      palate: "Full-bodied serif typography balanced by clean sans-serif data layers.",
      finish: "Long and verified — anchored immutably on-chain.",
    },
    imageUrl: undefined,
    videoUrl: "/dual-wine-vault-showcase.mp4",
  },
  provenance: [
    {
      id: "showcase-gen",
      timestamp: new Date().toISOString(),
      type: "GENERATED",
      description: "AI-generated cinematic showcase video",
      actor: "Claude · DUAL Protocol",
      verified: true,
    },
    {
      id: "showcase-mint",
      timestamp: new Date().toISOString(),
      type: "TOKENIZED",
      description: "Minted as ERC-721 on DUAL Network",
      actor: "DUAL Protocol",
      verified: true,
      txHash: "0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
    },
  ],
  faces: [],
  status: "anchored",
  ownerId: "0xDUAL-VAULT-SHOWCASE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  anchoredAt: new Date().toISOString(),
  blockchainTxHash: "0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
};

export async function GET() {
  const provider = getDataProvider();
  const wines = await provider.listWines();
  // Prepend the video showcase token
  return NextResponse.json([VIDEO_SHOWCASE_TOKEN, ...wines]);
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
