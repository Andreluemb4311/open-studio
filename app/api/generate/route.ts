import { NextResponse } from "next/server";
import { generateContentPackage } from "@/lib/providers/generation";
import { generateSchema, validateOr400 } from "@/lib/validation/schemas";
import { withRateLimitHeaders, validatePayloadSize, PAYLOAD_LIMITS } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  const sizeError = validatePayloadSize(request, PAYLOAD_LIMITS.briefing);
  if (sizeError) return sizeError;

  try {
    const body = await request.json();
    const validation = validateOr400(generateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const result = await generateContentPackage({
      briefing: validation.data.briefing,
      steps: ["text", "image"],
      saveToAssets: true,
    });

    return withRateLimitHeaders(NextResponse.json(result));
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to generate content package",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
