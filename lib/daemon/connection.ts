import { lookup } from "dns/promises";
import { isIP } from "net";

export type ConnectionErrorKind =
  | "auth_failed"
  | "rate_limited"
  | "not_found_model"
  | "invalid_base_url"
  | "forbidden"
  | "upstream_unavailable"
  | "timeout"
  | "unknown";

const PRIVATE_V4 = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^0\./,
];

function isLoopbackHost(hostname: string): boolean {
  const clean = hostname.toLowerCase();
  return clean === "localhost" || clean === "::1" || clean === "127.0.0.1" || clean.startsWith("127.");
}

function isPrivateAddress(address: string): boolean {
  if (address === "::1") return true;
  if (address.startsWith("fe80:") || address.startsWith("fc") || address.startsWith("fd")) return true;
  return PRIVATE_V4.some((pattern) => pattern.test(address));
}

export async function validateBaseUrl(rawUrl: string): Promise<{ ok: true } | { ok: false; error: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, error: "Base URL is not a valid URL." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, error: "Base URL must use http or https." };
  }

  if (isLoopbackHost(url.hostname)) return { ok: true };

  if (isIP(url.hostname) && isPrivateAddress(url.hostname)) {
    return { ok: false, error: "Remote private, link-local and reserved IP ranges are blocked." };
  }

  try {
    const records = await lookup(url.hostname, { all: true, verbatim: true });
    if (records.some((record) => isPrivateAddress(record.address))) {
      return { ok: false, error: "Base URL resolves to a private or reserved network address." };
    }
  } catch {
    return { ok: false, error: "Base URL hostname could not be resolved." };
  }

  return { ok: true };
}

export function classifyConnectionError(input: {
  status?: number;
  message?: string;
  code?: string;
}): ConnectionErrorKind {
  const message = `${input.message ?? ""} ${input.code ?? ""}`.toLowerCase();
  if (input.status === 401 || message.includes("api key") || message.includes("unauthorized")) return "auth_failed";
  if (input.status === 403 || message.includes("forbidden")) return "forbidden";
  if (input.status === 404 || message.includes("model") && message.includes("not found")) return "not_found_model";
  if (input.status === 429 || message.includes("rate limit")) return "rate_limited";
  if (input.status && input.status >= 500) return "upstream_unavailable";
  if (message.includes("timeout") || message.includes("abort")) return "timeout";
  if (message.includes("invalid") && message.includes("url")) return "invalid_base_url";
  return "unknown";
}
