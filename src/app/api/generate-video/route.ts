import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — Veo can take up to 6 min

/**
 * POST /api/generate-video
 * Generate an AI video using Google Gemini Veo.
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish, imageBase64?, imageMimeType? }
 *
 * If imageBase64 is provided, uses image-to-video (animates the AI-generated wine image).
 * Otherwise uses text-to-video.
 *
 * Returns: { success: true, videoUrl: string, prompt: string }
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
    const prompt = buildVideoPrompt(body);
    const imageBase64 = body.imageBase64;
    const imageMimeType = body.imageMimeType || "image/png";

    const ai = new GoogleGenAI({ apiKey });

    // Build the generation request
    const generateParams: any = {
      model: "veo-3.1-generate-preview",
      prompt,
      config: {
        aspectRatio: "16:9",
        numberOfVideos: 1,
      },
    };

    // If we have the AI-generated image, use image-to-video
    if (imageBase64) {
      generateParams.image = {
        imageBytes: imageBase64,
        mimeType: imageMimeType,
      };
    }

    // Submit generation (returns a long-running operation)
    let operation = await ai.models.generateVideos(generateParams);

    // Poll until done (every 10s, up to ~5 min)
    const maxPolls = 30;
    for (let i = 0; i < maxPolls && !operation.done; i++) {
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      return NextResponse.json(
        { error: "Video generation timed out. Please try again." },
        { status: 504 }
      );
    }

    // Extract the generated video
    const generatedVideos = operation.response?.generatedVideos || [];
    if (generatedVideos.length === 0) {
      return NextResponse.json(
        { error: "No video returned from Gemini Veo. Try a different description." },
        { status: 500 }
      );
    }

    const videoFile = generatedVideos[0].video;

    // Download the video and save locally
    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const { randomUUID } = await import("crypto");

    const publicDir = join(process.cwd(), "public", "uploads");
    await mkdir(publicDir, { recursive: true });
    const filename = `ai-video-${randomUUID().slice(0, 8)}.mp4`;
    const filepath = join(publicDir, filename);

    // Download from the Gemini-hosted URI
    if (videoFile?.uri) {
      const dlUrl = videoFile.uri.includes("?")
        ? `${videoFile.uri}&key=${apiKey}`
        : `${videoFile.uri}?key=${apiKey}`;
      const dlRes = await fetch(dlUrl);
      if (!dlRes.ok) {
        return NextResponse.json(
          { error: `Failed to download video: ${dlRes.status}` },
          { status: 500 }
        );
      }
      const buffer = Buffer.from(await dlRes.arrayBuffer());
      await writeFile(filepath, buffer);
    } else if (videoFile?.videoBytes) {
      // Some responses include raw bytes
      await writeFile(filepath, Buffer.from(videoFile.videoBytes, "base64"));
    } else {
      return NextResponse.json(
        { error: "Video generated but no download URI available." },
        { status: 500 }
      );
    }

    const videoUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      videoUrl,
      prompt,
    });
  } catch (err: any) {
    console.error("Video generation error:", err);
    return NextResponse.json(
      { error: err.message || "Video generation failed" },
      { status: 500 }
    );
  }
}

/**
 * Builds a cinematic video prompt from wine metadata.
 */
function buildVideoPrompt(data: Record<string, any>): string {
  const name = data.name || "Fine Wine";
  const producer = data.producer || "";
  const region = data.region || "";
  const country = data.country || "";
  const vintage = data.vintage || "";
  const varietal = data.varietal || "";
  const type = data.type || "red";
  const nose = data.nose || "";
  const palate = data.palate || "";
  const finish = data.finish || "";

  const visualMap: Record<string, string> = {
    red: "deep crimson wine, dark ruby tones, warm candlelight, oak barrel cellar",
    white: "golden straw-colored wine, bright sunlit vineyard, crystal clear glass, morning dew",
    sparkling: "champagne bubbles rising, celebration, golden fizz, crystal flutes, effervescent",
    "rosé": "delicate pink wine, rose petals, sunset hues, garden terrace",
    dessert: "amber honey-colored wine, rich golden tones, autumn harvest, sweet fruit",
    fortified: "deep mahogany wine, aged port barrel, vintage cellar, copper reflections",
  };

  const visualPalette = visualMap[type] || visualMap.red;

  const locationVibes =
    region && country
      ? `${region}, ${country} vineyard landscape`
      : region
        ? `${region} vineyard landscape`
        : "prestigious vineyard estate";

  const sensoryNotes = [nose, palate, finish].filter(Boolean).join(", ");
  const sensoryVisuals = sensoryNotes ? `Evoking ${sensoryNotes}.` : "";

  return [
    `Cinematic slow-motion close-up of a bottle of ${name}${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `${visualPalette}.`,
    `Set against ${locationVibes}.`,
    varietal ? `${varietal} grapes on the vine.` : "",
    `Wine being poured into a crystal glass with perfect clarity.`,
    sensoryVisuals,
    `Professional wine photography, 4K cinematic, shallow depth of field, golden hour lighting, luxury brand aesthetic.`,
  ].filter(Boolean).join(" ");
}
