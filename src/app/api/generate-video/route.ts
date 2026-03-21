import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for video generation

/**
 * POST /api/generate-video
 * Generate an AI video from wine metadata using Replicate's text-to-video models.
 *
 * Body: { name, producer, region, country, vintage, varietal, type, description,
 *         nose, palate, finish, abv, volume }
 *
 * Returns: { success: true, videoUrl: string, prompt: string }
 */
export async function POST(req: NextRequest) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN not configured. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Build a cinematic prompt from the wine metadata
    const prompt = buildVideoPrompt(body);

    const replicate = new Replicate({ auth: apiToken });

    // Use MiniMax Hailuo — fast, good quality, available on free tier
    // Falls back to Wan 2.1 if needed
    let output: any;

    try {
      // Try minimax/video-01 first (text-to-video, ~30s generation)
      output = await replicate.run(
        "minimax/video-01",
        {
          input: {
            prompt,
            prompt_optimizer: true,
          },
        }
      );
    } catch (primaryErr: any) {
      console.log("Primary model failed, trying fallback:", primaryErr.message);
      // Fallback to Wan 2.1 fast
      try {
        output = await replicate.run(
          "wan-video/wan-2.1-t2v-fast",
          {
            input: {
              prompt,
              num_frames: 81,       // ~5 seconds at 16fps
              resolution: "480p",
              sample_shift: 8,
              sample_guide_scale: 5,
            },
          }
        );
      } catch (fallbackErr: any) {
        console.log("Fallback model also failed, trying lightweight model:", fallbackErr.message);
        // Final fallback — lightweight model
        output = await replicate.run(
          "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
          {
            input: {
              prompt,
              num_frames: 36,
              width: 576,
              height: 320,
              num_inference_steps: 25,
            },
          }
        );
      }
    }

    // Replicate returns a URL (string) or ReadableStream or array
    let videoUrl: string = "";
    if (typeof output === "string") {
      videoUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      videoUrl = typeof output[0] === "string" ? output[0] : String(output[0]);
    } else if (output?.url) {
      videoUrl = output.url;
    } else if (output instanceof ReadableStream || (output && typeof output.pipe === "function")) {
      // Stream response — save to local file
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const { randomUUID } = await import("crypto");

      const publicDir = join(process.cwd(), "public", "uploads");
      await mkdir(publicDir, { recursive: true });
      const filename = `ai-video-${randomUUID().slice(0, 8)}.mp4`;
      const filepath = join(publicDir, filename);

      // Collect stream chunks
      const chunks: Uint8Array[] = [];
      const reader = (output as ReadableStream).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const buffer = Buffer.concat(chunks);
      await writeFile(filepath, buffer);
      videoUrl = `/uploads/${filename}`;
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video generation returned no output. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      prompt,
    });
  } catch (err: any) {
    console.error("Video generation error:", err);
    const message = err.message || "Video generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Builds a cinematic video prompt from wine metadata.
 * Designed to produce a visually rich, atmospheric short clip.
 */
function buildVideoPrompt(data: Record<string, any>): string {
  const name = data.name || "Fine Wine";
  const producer = data.producer || "";
  const region = data.region || "";
  const country = data.country || "";
  const vintage = data.vintage || "";
  const varietal = data.varietal || "";
  const type = data.type || "red";
  const description = data.description || "";
  const nose = data.nose || "";
  const palate = data.palate || "";
  const finish = data.finish || "";

  // Map wine type to visual palette
  const visualMap: Record<string, string> = {
    red: "deep crimson wine, dark ruby tones, warm candlelight, oak barrel cellar",
    white: "golden straw-colored wine, bright sunlit vineyard, crystal clear glass, morning dew",
    sparkling: "champagne bubbles rising, celebration, golden fizz, crystal flutes, effervescent",
    "rosé": "delicate pink wine, rose petals, sunset hues, garden terrace",
    dessert: "amber honey-colored wine, rich golden tones, autumn harvest, sweet fruit",
    fortified: "deep mahogany wine, aged port barrel, vintage cellar, copper reflections",
  };

  const visualPalette = visualMap[type] || visualMap.red;

  // Build location atmosphere
  const locationVibes = region && country
    ? `${region}, ${country} vineyard landscape, terroir`
    : region
      ? `${region} vineyard landscape`
      : "prestigious vineyard estate";

  // Build tasting atmosphere from notes
  const sensoryNotes = [nose, palate, finish].filter(Boolean).join(", ");
  const sensoryVisuals = sensoryNotes
    ? `Evoking flavours of ${sensoryNotes}.`
    : "";

  const prompt = [
    `Cinematic slow-motion close-up of a bottle of ${name}${vintage ? ` ${vintage}` : ""}${producer ? ` by ${producer}` : ""}.`,
    `${visualPalette}.`,
    `Set against ${locationVibes}.`,
    `${varietal ? `${varietal} grapes on the vine.` : ""}`,
    `Wine being poured into a crystal glass with perfect clarity.`,
    sensoryVisuals,
    `Professional wine photography, 4K cinematic, shallow depth of field, golden hour lighting, luxury brand aesthetic, moody atmospheric, dramatic shadows.`,
    description ? `Context: ${description.slice(0, 100)}.` : "",
  ].filter(Boolean).join(" ");

  return prompt;
}
