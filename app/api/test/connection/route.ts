import { NextResponse } from "next/server";
import { classifyConnectionError, validateBaseUrl } from "@/lib/daemon/connection";
import { runtimeConfigFromPayload, type ProviderConnectionPayload } from "@/lib/providers/connectionPayload";
import { getAdapterForProvider } from "@/lib/providers/registry";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProviderConnectionPayload;
    const config = runtimeConfigFromPayload(body);
    const baseUrl = await validateBaseUrl(config.baseUrl);
    if (!baseUrl.ok) {
      return NextResponse.json({
        ok: false,
        models: [],
        error: baseUrl.error,
        errorKind: "invalid_base_url",
      });
    }

    const adapter = getAdapterForProvider(config.providerId);
    const result = await adapter.testConnection(config);
    return NextResponse.json({
      ...result,
      errorKind: result.ok ? undefined : classifyConnectionError({ message: result.error }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json({
      ok: false,
      models: [],
      error: message,
      errorKind: classifyConnectionError({ message }),
    });
  }
}
