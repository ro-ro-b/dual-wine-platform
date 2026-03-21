import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for video generation

const NANO_BANANA_BASE = "https://nanobananavideo.com/api/v1";

/**
 * POST /api/generate-video
 * Generate an AI video from wine metadata using Nano Banana Video API.
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish, abv, volume, imageUrl? }
 *
 * If imageUrl is provided, uses image-to-video (animates the AI-generated wine image).
 * Otherwise uses text-to-video.
 *
 * Returns: { success: true, videoUrl: string, thumbnailUrl?: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.NANO_BANANA_VIDEO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NANO_BANANA_VIDEO_API_KEY not configured. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = buildVideoPrompt(body);
    const imageUrl = body.imageUrl; // AI-generated image from previous step

    // Choose endpoint based on whether we have an image
    let endpoint: string;
    let payload: Record<string, any>;

    if (imageUrl) {
      // Image-to-Video: animate the AI wine image
      endpoint = `${NANO_BANANA_BASE}/image-to-video.php`;
      payload = {
        image_urls: [imageUrl],
        prompt: `Animate this wine product image with subtle cinematic motion: gentle camera drift, light particles, soft liquid movement. ${prompt}`,
        resolution: "720p",
        duration: 5,
        aspect_ratio: "16:9",
      };
    } else {
      // Text-to-Video: generate entirely from text
      endpoint = `${NANO_BANANA_BASE}/text-to-video.php`;
      payload = {
        prompt,
        resolution: "720p",
        duration: 5,
        aspect_ratio: "16:9",
      };
    }

    // Step 1: Submit generation request
    const genRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const genData = await genRes.json();

    if (!genRes.ok || !genData.success) {
      const errMsg = genData.error || `Nano Banana Video API error (${genRes.status})`;
      return NextResponse.json({ error: errMsg }, { status: genRes.status || 500 });
    }

    // If video_url is returned immediately, use it
    if (genData.video_url) {
      return NextResponse.json({
        success: true,
        videoUrl: genData.video_url,
        thumbnailUrl: genData.thumbnail_url || null,
        prompt,
      });
    }

    // Step 2: If async, poll for completion
    const videoId = genData.video_id;
    if (!videoId) {
      return NextResponse.json(
        { error: "No video_id or video_url returned from Nano Banana Video." },
        { status: 500 }
      );
    }

    // Poll with backoff (max ~2 minutes)
    let videoUrl = "";
    let thumbnailUrl = "";
    const maxAttempts = 24;
    let delay = 5000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, delay));

      const statusRes = await fetch(
        `${NANO_BANANA_BASE}/video-status.php?video_id=${videoId}`,
        { headers: { "X-API-Key": apiKey } }
      );
      const statusData = await statusRes.json();

      if (statusData.status === "completed") {
        videoUrl = statusData.video_url || statusData.url || "";
        thumbnailUrl = statusData.thumbnail_url || "";
        break;
      }

      if (statusData.status === "failed") {
        return NextResponse.json(
          { error: statusData.error || "Video generation failed on Nano Banana." },
          { status: 500 }
        );
      }

      delay = Math.min(delay * 1.2, 10000);
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video generation timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      thumbnailUrl,
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

  const parts = [
    `Cinematic slow-motion of ${name}${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `${visualPalette}.`,
    `Set against ${locationVibes}.`,
    varietal ? `${varietal} grapes.` : "",
    `Wine poured into crystal glass.`,
    sensoryVisuals,
    `4K cinematic, shallow depth of field, golden hour, luxury aesthetic.`,
  ].filter(Boolean);

  // Keep under 500 chars (Nano Banana limit)
  let prompt = parts.join(" ");
  if (prompt.length > 500) prompt = prompt.slice(0, 497) + "...";
  return prompt;
}
