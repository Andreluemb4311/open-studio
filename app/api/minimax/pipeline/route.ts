import { NextResponse } from "next/server";
import { generateContentPackage } from "@/lib/providers/generation";
import { pipelineSchema, validateOr400 } from "@/lib/validation/schemas";
import { withRateLimitHeaders, validatePayloadSize, PAYLOAD_LIMITS } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  const sizeError = validatePayloadSize(request, PAYLOAD_LIMITS.briefing);
  if (sizeError) return sizeError;

  try {
    const body = await request.json();
    const validation = validateOr400(pipelineSchema, body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const result = (await generateContentPackage({
      briefing: validation.data.briefing,
      steps: validation.data.generateThumbnail ? ["text", "image"] : ["text"],
      saveToAssets: true,
    })) as {
      outputs?: Record<string, unknown>;
      package?: unknown;
      exportId?: string;
    };

    return withRateLimitHeaders(
      NextResponse.json({
        ok: true,
        status: {
          script: { status: "completed", output: result.outputs?.text },
          thumbnail: result.outputs?.image
            ? { status: "completed", output: result.outputs.image }
            : { status: "skipped" },
          package: { status: "completed", output: result.package },
        },
        exportId: result.exportId,
        package: result.package,
      })
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Pipeline execution failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
