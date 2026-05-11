import { validateBaseUrl } from "./connection";

export type ProxyProvider = "anthropic" | "openai" | "azure" | "google" | "ollama";

export interface ProxyRequestBody {
  baseUrl: string;
  apiKey?: string;
  model: string;
  systemPrompt?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
  apiVersion?: string;
}

function encoderEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function providerUrl(provider: ProxyProvider, body: ProxyRequestBody): string {
  if (provider === "anthropic") return `${body.baseUrl.replace(/\/$/, "")}/v1/messages`;
  if (provider === "google") {
    const base = body.baseUrl.replace(/\/$/, "");
    const model = body.model.startsWith("models/") ? body.model : `models/${body.model}`;
    const url = new URL(`${base}/v1beta/${model}:streamGenerateContent`);
    if (body.apiKey) url.searchParams.set("key", body.apiKey);
    return url.toString();
  }
  if (provider === "azure") {
    const url = new URL(`${body.baseUrl.replace(/\/$/, "")}/chat/completions`);
    url.searchParams.set("api-version", body.apiVersion || "2024-10-21");
    return url.toString();
  }
  return `${body.baseUrl.replace(/\/$/, "")}/chat/completions`;
}

function providerHeaders(provider: ProxyProvider, body: ProxyRequestBody): HeadersInit {
  if (provider === "anthropic") {
    return {
      "content-type": "application/json",
      "x-api-key": body.apiKey || "",
      "anthropic-version": "2023-06-01",
    };
  }
  if (provider === "azure") {
    return {
      "content-type": "application/json",
      "api-key": body.apiKey || "",
    };
  }
  if (provider === "google" || provider === "ollama") {
    return { "content-type": "application/json" };
  }
  return {
    "content-type": "application/json",
    authorization: `Bearer ${body.apiKey || ""}`,
  };
}

function providerPayload(provider: ProxyProvider, body: ProxyRequestBody): Record<string, unknown> {
  const messages = body.systemPrompt
    ? [{ role: "system" as const, content: body.systemPrompt }, ...body.messages]
    : body.messages;

  if (provider === "anthropic") {
    return {
      model: body.model,
      max_tokens: body.maxTokens ?? 4096,
      temperature: body.temperature ?? 0.7,
      stream: true,
      system: body.systemPrompt,
      messages: body.messages.filter((message) => message.role !== "system"),
    };
  }

  if (provider === "google") {
    return {
      contents: body.messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
      systemInstruction: body.systemPrompt ? { parts: [{ text: body.systemPrompt }] } : undefined,
      generationConfig: {
        maxOutputTokens: body.maxTokens ?? 4096,
        temperature: body.temperature ?? 0.7,
      },
    };
  }

  return {
    model: body.model,
    messages,
    max_tokens: body.maxTokens ?? 4096,
    temperature: body.temperature ?? 0.7,
    stream: true,
  };
}

function extractDelta(provider: ProxyProvider, json: Record<string, unknown>): string {
  if (provider === "anthropic") {
    const delta = json.delta as Record<string, unknown> | undefined;
    return typeof delta?.text === "string" ? delta.text : "";
  }

  if (provider === "google") {
    const candidates = json.candidates as Array<Record<string, unknown>> | undefined;
    const parts = candidates?.[0]?.content && typeof candidates[0].content === "object"
      ? (candidates[0].content as Record<string, unknown>).parts
      : undefined;
    return Array.isArray(parts)
      ? parts.map((part) => (typeof part?.text === "string" ? part.text : "")).join("")
      : "";
  }

  const choices = json.choices as Array<Record<string, unknown>> | undefined;
  const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
  return typeof delta?.content === "string" ? delta.content : "";
}

export async function createProxyStream(provider: ProxyProvider, body: ProxyRequestBody): Promise<Response> {
  const baseUrlResult = await validateBaseUrl(body.baseUrl);
  if (!baseUrlResult.ok) {
    return new Response(encoderEvent("error", { error: baseUrlResult.error }), {
      status: 400,
      headers: { "content-type": "text/event-stream" },
    });
  }

  const upstream = await fetch(providerUrl(provider, body), {
    method: "POST",
    headers: providerHeaders(provider, body),
    body: JSON.stringify(providerPayload(provider, body)),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(encoderEvent("start", { provider, model: body.model })));

      if (!upstream.ok || !upstream.body) {
        controller.enqueue(encoder.encode(encoderEvent("error", { status: upstream.status, error: await upstream.text() })));
        controller.close();
        return;
      }

      let buffer = "";
      for await (const chunk of upstream.body as unknown as AsyncIterable<Uint8Array>) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const delta = extractDelta(provider, parsed);
            if (delta) controller.enqueue(encoder.encode(encoderEvent("delta", { delta })));
          } catch {
            controller.enqueue(encoder.encode(encoderEvent("delta", { delta: raw })));
          }
        }
      }

      controller.enqueue(encoder.encode(encoderEvent("end", { provider, model: body.model })));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
