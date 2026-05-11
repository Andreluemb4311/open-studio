import { NextResponse } from "next/server";
import { generateTextWithProvider } from "@/lib/providers/generation";
import { createAsset } from "@/lib/storage/assets";
import { titleGenerateSchema, validateOr400 } from "@/lib/validation/schemas";
import { PAYLOAD_LIMITS, validatePayloadSize, withRateLimitHeaders } from "@/lib/security/rateLimit";

type TitleCandidate = {
  title: string;
  score: number;
  reason: string;
  ctrAngle?: string;
  seoKeywords?: string[];
  rank?: number;
};

const systemPrompt = `You are Open Studio's YouTube title strategist.
Generate high-CTR, SEO-aware video titles from the user's topic and context.
Use outlier-style thinking: curiosity gap, specificity, contrast, transformation, and searchable wording.
Return only valid JSON:
{
  "candidates": [
    {
      "title": "string",
      "score": 0-100,
      "reason": "short reason",
      "ctrAngle": "short angle",
      "seoKeywords": ["keyword"]
    }
  ],
  "top3": ["exact title", "exact title", "exact title"]
}`;

function parseTitleResponse(content: string, count: number): { candidates: TitleCandidate[]; top3: TitleCandidate[] } {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  const rawJson = start >= 0 && end >= start ? content.slice(start, end + 1) : content;

  try {
    const parsed = JSON.parse(rawJson) as { candidates?: unknown; top3?: unknown };
    const candidates = Array.isArray(parsed.candidates)
      ? parsed.candidates
          .map((item, index): TitleCandidate | null => {
            if (!item || typeof item !== "object") return null;
            const record = item as Record<string, unknown>;
            const title = String(record.title ?? "").trim();
            if (!title) return null;
            return {
              title,
              score: Number(record.score ?? Math.max(70, 100 - index * 3)),
              reason: String(record.reason ?? record.why ?? "CTR/SEO candidate."),
              ctrAngle: record.ctrAngle ? String(record.ctrAngle) : undefined,
              seoKeywords: Array.isArray(record.seoKeywords) ? record.seoKeywords.map(String) : [],
              rank: index + 1,
            };
          })
          .filter((item): item is TitleCandidate => Boolean(item))
      : [];

    const normalized = candidates.slice(0, count);
    const top3Titles = Array.isArray(parsed.top3) ? parsed.top3.map(String) : [];
    const top3 =
      top3Titles
        .map((title) => normalized.find((candidate) => candidate.title === title))
        .filter((item): item is TitleCandidate => Boolean(item))
        .slice(0, 3);

    return {
      candidates: normalized,
      top3: top3.length ? top3 : normalized.slice(0, 3),
    };
  } catch {
    const candidates = content
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim())
      .filter(Boolean)
      .slice(0, count)
      .map((title, index) => ({
        title,
        score: Math.max(70, 100 - index * 3),
        reason: "Provider returned plain text; ranked by order.",
        rank: index + 1,
      }));

    return { candidates, top3: candidates.slice(0, 3) };
  }
}

export async function POST(request: Request) {
  const sizeError = validatePayloadSize(request, PAYLOAD_LIMITS.briefing);
  if (sizeError) return sizeError;

  try {
    const body = await request.json();
    const validation = validateOr400(titleGenerateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const { provider, saveToAssets, count, ...params } = validation.data;
    const prompt = [
      `TOPIC: ${params.topic}`,
      params.briefing ? `BRIEFING: ${params.briefing}` : "",
      params.audience ? `AUDIENCE: ${params.audience}` : "",
      params.thumbnailConcept ? `THUMBNAIL_CONCEPT: ${params.thumbnailConcept}` : "",
      params.outlierNotes ? `OUTLIER_NOTES: ${params.outlierNotes}` : "",
      `COUNT: ${count}`,
      "Return exactly the requested number of candidates and mark the best 3.",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await generateTextWithProvider(
      {
        systemPrompt,
        prompt,
        maxTokens: 2600,
        temperature: 0.85,
      },
      provider
    );

    const parsed = parseTitleResponse(result.content, count);

    if (saveToAssets) {
      await createAsset({
        type: "prompt",
        title: `Title Pack - ${params.topic}`,
        description: params.briefing?.slice(0, 500) || params.topic,
        content: JSON.stringify(parsed, null, 2),
        metadata: {
          ...params,
          providerId: result.providerId,
          model: result.model,
        },
        sourceModule: "title-generator",
        tags: ["titles", "ctr", "seo"],
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
      { ok: false, error: "Failed to generate titles", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
