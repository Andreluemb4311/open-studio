import { NextResponse } from "next/server";
import { createProxyStream, type ProxyProvider } from "@/lib/daemon/proxy";

const proxyProviders = new Set(["anthropic", "openai", "azure", "google", "ollama"]);

type Context = { params: Promise<{ provider: string }> };

export async function POST(request: Request, { params }: Context) {
  const { provider } = await params;
  if (!proxyProviders.has(provider)) {
    return NextResponse.json({ ok: false, error: "Unsupported proxy provider" }, { status: 404 });
  }

  const body = await request.json();
  return createProxyStream(provider as ProxyProvider, body);
}
