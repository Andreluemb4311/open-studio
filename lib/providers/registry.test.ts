import { describe, expect, it } from "vitest";
import { createDefaultProviderConfig, getManifestsForCapability, getProviderManifest } from "./manifests";
import { assertProviderCapability, listProviderManifests } from "./registry";

describe("provider registry", () => {
  it("registers native and compatible providers", () => {
    const providers = listProviderManifests().map((provider) => provider.id);

    expect(providers).toContain("minimax");
    expect(providers).toContain("openai-compatible");
    expect(providers).toContain("openai");
    expect(providers).toContain("anthropic");
    expect(providers).toContain("gemini");
    expect(providers).toContain("ollama");
  });

  it("filters providers by capability", () => {
    const textProviders = getManifestsForCapability("text").map((provider) => provider.id);
    const imageProviders = getManifestsForCapability("image").map((provider) => provider.id);

    expect(textProviders).toContain("openai-compatible");
    expect(textProviders).toContain("ollama");
    expect(imageProviders).toContain("fal");
  });

  it("rejects unsupported provider capability combinations", () => {
    expect(() => assertProviderCapability("anthropic", "image")).toThrow(/does not support image/);
  });

  it("creates default provider config without API keys", () => {
    const manifest = getProviderManifest("minimax");
    expect(manifest).toBeDefined();
    if (!manifest) return;

    const config = createDefaultProviderConfig(manifest);
    expect(config.apiKey).toBe("");
    expect(config.models.text).toBe("MiniMax-M2.7");
  });
});
