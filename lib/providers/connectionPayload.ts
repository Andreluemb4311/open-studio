import { getProviderManifest } from "@/lib/providers/manifests";
import type { ActiveProviderCapability, ProviderRuntimeConfig, ProviderStoredConfig } from "@/lib/providers/types";

export interface ProviderConnectionPayload {
  providerId?: string;
  capability?: ActiveProviderCapability;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  models?: ProviderStoredConfig["models"];
  customHeaders?: ProviderStoredConfig["customHeaders"];
  extra?: ProviderStoredConfig["extra"];
}

export function runtimeConfigFromPayload(payload: ProviderConnectionPayload): ProviderRuntimeConfig {
  const providerId = payload.providerId?.trim();
  if (!providerId) throw new Error("providerId is required");

  const manifest = getProviderManifest(providerId);
  if (!manifest) throw new Error(`Unknown provider "${providerId}".`);

  const capability =
    payload.capability ??
    manifest.capabilities.find((item): item is ActiveProviderCapability => item === "text" || item === "image");
  if (!capability) throw new Error(`${manifest.name} has no active text/image capability.`);
  if (!manifest.capabilities.includes(capability)) {
    throw new Error(`${manifest.name} does not support ${capability} generation.`);
  }

  const models = {
    ...manifest.defaultModels,
    ...payload.models,
    [capability]: payload.model || payload.models?.[capability] || manifest.defaultModels[capability],
  };

  return {
    providerId,
    manifest,
    enabled: true,
    apiKey: payload.apiKey ?? "",
    baseUrl: payload.baseUrl || manifest.defaultBaseUrl,
    models,
    customHeaders: payload.customHeaders ?? {},
    extra: { ...manifest.extraDefaults, ...payload.extra },
  };
}
