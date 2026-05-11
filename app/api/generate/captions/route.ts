import { NextResponse } from "next/server";
import { generateTextWithProvider } from "@/lib/providers/generation";
import { createAsset } from "@/lib/storage/assets";
import { captionGenerateSchema, validateOr400 } from "@/lib/validation/schemas";
import { PAYLOAD_LIMITS, validatePayloadSize, withRateLimitHeaders } from "@/lib/security/rateLimit";

const systemPrompt = `You are Open Studio's caption formatter.
Create social captions only according to the user-provided caption pattern.
Do not invent a house style when the pattern is missing.
Return only valid JSON with:
{
  "captions": ["caption"],
  "notes": ["short note"]
}`;

function parseCaptionResponse(content: string): { captions: string[]; notes: string[] } {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  const rawJson = start >= 0 && end >= start ? content.slice(start, end + 1) : content;

  try {
    const parsed = JSON.parse(rawJson) as { captions?: unknown; notes?: unknown };
    return {
      captions: Array.isArray(parsed.captions) ? parsed.captions.map(String).filter(Boolean) : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes.map(String).filter(Boolean) : [],
    };
  } catch {
    return {
      captions: content.split(/\n{2,}/).map((caption) => caption.trim()).filter(Boolean),
      notes: ["Provider returned plain text instead of JSON."],
    };
  }
}

export async function POST(request: Request) {
  const sizeError = validatePayloadSize(request, PAYLOAD_LIMITS.briefing);
  if (sizeError) return sizeError;

  try {
    const body = await request.json();
    const validation = validateOr400(captionGenerateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const { script, pattern, provider, saveToAssets } = validation.data;
    if (!pattern?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "caption_pattern_required",
          details: "A rota de legendas já está registrada, mas precisa do padrão do Lucas antes de gerar.",
        },
        { status: 422 }
      );
    }

    const result = await generateTextWithProvider(
      {
        systemPrompt,
        prompt: [`PATTERN:\n${pattern}`, `SCRIPT:\n${script}`].join("\n\n"),
        maxTokens: 2400,
        temperature: 0.55,
      },
      provider
    );
    const parsed = parseCaptionResponse(result.content);

    if (saveToAssets) {
      await createAsset({
        type: "prompt",
        title: "Caption Pack",
        description: script.slice(0, 500),
        content: JSON.stringify(parsed, null, 2),
        metadata: {
          pattern,
          providerId: result.providerId,
          model: result.model,
        },
        sourceModule: "caption-generator",
        tags: ["captions"],
      });
    }

    return withRateLimitHeaders(
      NextResponse.json({
        ok: true,
        ...parsed,
        providerId: result.providerId,
        model: result.model,
      })
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to generate captions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
