import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const NANO_BANANA_BASE = "https://api.nanobananaapi.ai/api/v1/nanobanana";

/**
 * POST /api/generate-image
 * Generate an AI image from wine metadata using Nano Banana Image API.
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish }
 *
 * Returns: { success: true, imageUrl: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.NANO_BANANA_IMAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NANO_BANANA_IMAGE_API_KEY not configured. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = buildImagePrompt(body);

    // Step 1: Submit generation task
    const genRes = await fetch(`${NANO_BANANA_BASE}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        type: "TEXTTOIAMGE",
        numImages: 1,
      }),
    });

    const genData = await genRes.json();

    if (genData.code !== 200 || !genData.data?.taskId) {
      return NextResponse.json(
        { error: genData.msg || `Nano Banana Image API error (${genRes.status})` },
        { status: genRes.status || 500 }
      );
    }

    const taskId = genData.data.taskId;

    // Step 2: Poll for completion (every 3s, up to ~90s)
    const maxAttempts = 30;
    const pollInterval = 3000;
    let imageUrl = "";

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));

      const statusRes = await fetch(
        `${NANO_BANANA_BASE}/record-info?taskId=${taskId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      const statusData = await statusRes.json();

      if (statusData.successFlag === 1) {
        // Success
        imageUrl =
          statusData.response?.resultImageUrl ||
          statusData.response?.imageUrl ||
          "";
        break;
      }

      if (statusData.successFlag === 2 || statusData.successFlag === 3) {
        // Failed
        return NextResponse.json(
          {
            error:
              statusData.errorMessage ||
              "Image generation failed on Nano Banana.",
          },
          { status: 500 }
        );
      }

      // successFlag === 0 means still generating — keep polling
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image generation timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
    });
  } catch (err: any) {
    console.error("Image generation error:", err);
    return NextResponse.json(
      { error: err.message || "Image generation failed" },
      { status: 500 }
    );
  }
}

/**
 * Builds a product-photography-style prompt from wine metadata.
 */
function buildImagePrompt(data: Record<string, any>): string {
  const name = data.name || "Fine Wine";
  const producer = data.producer || "";
  const region = data.region || "";
  const country = data.country || "";
  const vintage = data.vintage || "";
  const varietal = data.varietal || "";
  const type = data.type || "red";
  const nose = data.nose || "";

  const colorMap: Record<string, string> = {
    red: "deep ruby red wine in glass, dark moody lighting, burgundy tones",
    white: "pale golden white wine in crystal glass, bright natural light, straw tones",
    sparkling: "champagne with fine bubbles in flute glass, celebratory golden light",
    "rosé": "delicate salmon-pink rosé in stemmed glass, soft sunset lighting",
    dessert: "rich amber dessert wine, warm honey-gold tones, candlelight",
    fortified: "deep mahogany port wine in small glass, vintage cellar atmosphere",
  };

  const colorPalette = colorMap[type] || colorMap.red;

  const parts = [
    `Professional wine product photography of "${name}"${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `Elegant wine bottle with premium label design, ${colorPalette}.`,
    region
      ? `Vineyard landscape of ${region}${country ? `, ${country}` : ""} subtly in background.`
      : "",
    varietal ? `${varietal} grape variety.` : "",
    nose ? `Aromatic elements suggesting ${nose}.` : "",
    `Studio-quality lighting, shallow depth of field, luxury product photography, editorial wine magazine style.`,
    `Dark elegant background, photorealistic.`,
  ].filter(Boolean);

  return parts.join(" ");
}
