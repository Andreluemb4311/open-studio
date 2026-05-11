import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/storage/settings";
import { settingsSchema, validateOr400 } from "@/lib/validation/schemas";

function stripMediaKeys(mediaProviders: Awaited<ReturnType<typeof getSettings>>["mediaProviders"]) {
  return Object.fromEntries(
    Object.entries(mediaProviders).map(([providerId, config]) => {
      const { apiKey: rawApiKey, ...safeConfig } = config;
      const apiKey = rawApiKey?.trim() ?? "";
      return [
        providerId,
        {
          ...safeConfig,
          apiKeyConfigured: Boolean(apiKey || config.apiKeyConfigured),
          apiKeyTail: apiKey ? apiKey.slice(-4) : config.apiKeyTail,
        },
      ];
    })
  );
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ ok: true, mediaProviders: stripMediaKeys(settings.mediaProviders) });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const validation = validateOr400(settingsSchema.pick({ mediaProviders: true }), body);
  if (!validation.success) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const result = await updateSettings({ mediaProviders: validation.data.mediaProviders ?? {} });
  return NextResponse.json({ ok: true, mediaProviders: stripMediaKeys(result.mediaProviders) });
}
