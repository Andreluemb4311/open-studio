import { describe, expect, it } from "vitest";
import { getDefaultSettings } from "./settings";
import { sanitizeAgentCliEnv } from "@/lib/daemon/agentConfig";

describe("provider settings defaults", () => {
  it("creates local BYOK provider settings without stored keys", () => {
    const settings = getDefaultSettings();

    expect(settings.providers.minimax.apiKey).toBe("");
    expect(settings.providers["openai-compatible"].apiKey).toBe("");
    expect(settings.defaults.text.providerId).toBe("minimax");
  });

  it("keeps generation defaults per capability", () => {
    const settings = getDefaultSettings();

    expect(settings.defaults.image.model).toBe("image-01");
    expect(Object.keys(settings.defaults)).toEqual(["text", "image"]);
  });

  it("sanitizes agent CLI env to known agent keys", () => {
    expect(
      sanitizeAgentCliEnv({
        codex: { CODEX_BIN: " codex ", BAD_KEY: "x" },
        bad: { BAD_KEY: "x" },
      })
    ).toEqual({ codex: { CODEX_BIN: "codex" } });
  });
});
