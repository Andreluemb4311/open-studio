import { NextResponse } from "next/server";
import { runtimeConfigFromPayload, type ProviderConnectionPayload } from "@/lib/providers/connectionPayload";
import { getAdapterForProvider } from "@/lib/providers/registry";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProviderConnectionPayload;
    const config = runtimeConfigFromPayload(body);
    const adapter = getAdapterForProvider(config.providerId);
    const models = adapter.listModels ? await adapter.listModels(config) : Object.values(config.manifest.defaultModels).filter(Boolean);
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      models: [],
      error: error instanceof Error ? error.message : "Failed to list models",
    });
  }
}
