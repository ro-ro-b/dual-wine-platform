import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/generate-image
 * Generate an AI wine product image using Google Gemini (Nano Banana).
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish }
 *
 * Returns: { success: true, imageUrl: string, imageBase64: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Get one at https://aistudio.google.com/apikey" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = buildImagePrompt(body);

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "3:4", // Portrait — ideal for wine bottles
          imageSize: "1K",
        },
      },
    });

    // Extract image from response
    let imageBase64 = "";
    let mimeType = "image/png";

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image returned from Gemini. Try adjusting the wine description." },
        { status: 500 }
      );
    }

    // Save to public/uploads/
    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const { randomUUID } = await import("crypto");

    const ext = mimeType.includes("jpeg") ? "jpg" : "png";
    const filename = `ai-wine-${randomUUID().slice(0, 8)}.${ext}`;
    const publicDir = join(process.cwd(), "public", "uploads");
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, filename), Buffer.from(imageBase64, "base64"));

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      imageBase64, // Pass to video generation for image-to-video
      mimeType,
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

  return [
    `Professional wine product photography of "${name}"${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `Elegant wine bottle with premium label design, ${colorPalette}.`,
    region ? `Vineyard landscape of ${region}${country ? `, ${country}` : ""} subtly in background.` : "",
    varietal ? `${varietal} grape variety.` : "",
    nose ? `Aromatic elements suggesting ${nose}.` : "",
    `Studio-quality lighting, shallow depth of field, luxury product photography, editorial wine magazine style.`,
    `Dark elegant background, photorealistic.`,
  ].filter(Boolean).join(" ");
}
