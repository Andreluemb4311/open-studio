import { NextResponse } from "next/server";
import { getAdapterForProvider } from "@/lib/providers/registry";
import { resolveProviderConfig } from "@/lib/providers/runtime";
import { getProviderManifest } from "@/lib/providers/manifests";
import { classifyConnectionError, validateBaseUrl } from "@/lib/daemon/connection";
import type { ActiveProviderCapability } from "@/lib/providers/types";

type Context = { params: Promise<{ providerId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { providerId } = await params;
  try {
    const manifest = getProviderManifest(providerId);
    if (!manifest) {
      return NextResponse.json({ ok: false, models: [], error: "Unknown provider" }, { status: 404 });
    }

    const capability = manifest.capabilities.find((item): item is ActiveProviderCapability => item === "text" || item === "image");
    if (!capability) {
      return NextResponse.json({ ok: false, models: [], error: "Provider has no active capabilities" }, { status: 400 });
    }
    const config = await resolveProviderConfig(capability, { providerId });
    const baseUrl = await validateBaseUrl(config.baseUrl);
    if (!baseUrl.ok) {
      return NextResponse.json({
        ok: false,
        models: [],
        error: baseUrl.error,
        errorKind: "invalid_base_url",
      });
    }

    const adapter = getAdapterForProvider(providerId);
    const result = await adapter.testConnection(config);
    return NextResponse.json({
      ...result,
      errorKind: result.ok ? undefined : classifyConnectionError({ message: result.error }),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      models: [],
      error: error instanceof Error ? error.message : "Connection failed",
      errorKind: classifyConnectionError({ message: error instanceof Error ? error.message : "Connection failed" }),
    });
  }
}
