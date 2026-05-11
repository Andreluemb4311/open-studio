import { NextResponse } from "next/server";
import { getAdapterForProvider } from "@/lib/providers/registry";
import { resolveProviderConfig } from "@/lib/providers/runtime";
import { classifyConnectionError, validateBaseUrl } from "@/lib/daemon/connection";

export async function GET() {
  try {
    const config = await resolveProviderConfig("text", { providerId: "minimax" });
    if (!config.apiKey) {
      return NextResponse.json({
        ok: false,
        models: [],
        error: "API Key not configured. Please go to Settings and add your MiniMax API key.",
        errorKind: "auth_failed",
      });
    }

    const baseUrl = await validateBaseUrl(config.baseUrl);
    if (!baseUrl.ok) {
      return NextResponse.json({ ok: false, models: [], error: baseUrl.error, errorKind: "invalid_base_url" });
    }

    const result = await getAdapterForProvider("minimax").testConnection(config);
    return NextResponse.json({
      ...result,
      errorKind: result.ok ? undefined : classifyConnectionError({ message: result.error }),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      models: [],
      error: error instanceof Error ? error.message : "Connection test failed",
      errorKind: classifyConnectionError({ message: error instanceof Error ? error.message : "Connection test failed" }),
    });
  }
}
