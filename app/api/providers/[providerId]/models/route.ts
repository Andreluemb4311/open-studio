import { NextResponse } from "next/server";
import { getAdapterForProvider } from "@/lib/providers/registry";
import { resolveProviderConfig } from "@/lib/providers/runtime";
import { getProviderManifest } from "@/lib/providers/manifests";
import type { ActiveProviderCapability } from "@/lib/providers/types";

type Context = { params: Promise<{ providerId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { providerId } = await params;
  try {
    const manifest = getProviderManifest(providerId);
    if (!manifest) {
      return NextResponse.json({ ok: false, models: [], error: "Unknown provider" }, { status: 404 });
    }

    if (!manifest.modelDiscovery) {
      return NextResponse.json({
        ok: true,
        models: Object.values(manifest.defaultModels).filter(Boolean),
        manual: true,
      });
    }

    const capability = manifest.capabilities.find((item): item is ActiveProviderCapability => item === "text" || item === "image");
    if (!capability) {
      return NextResponse.json({ ok: false, models: [], error: "Provider has no active capabilities" }, { status: 400 });
    }

    const config = await resolveProviderConfig(capability, { providerId });
    const adapter = getAdapterForProvider(providerId);
    const models = adapter.listModels ? await adapter.listModels(config) : [];
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      models: [],
      error: error instanceof Error ? error.message : "Failed to list models",
    });
  }
}
