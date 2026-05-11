import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  listAgents: vi.fn(),
}));

vi.mock("@/lib/storage/settings", () => ({
  getSettings: mocks.getSettings,
  updateSettings: mocks.updateSettings,
}));

vi.mock("@/lib/daemon/agents", () => ({
  listAgents: mocks.listAgents,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/agents", () => {
  it("lists agents using persisted CLI env overrides", async () => {
    const agentCliEnv = { codex: { CODEX_BIN: "C:\\Tools\\codex.cmd" } };
    mocks.getSettings.mockResolvedValue({ agentId: "codex", agentCliEnv });
    mocks.listAgents.mockResolvedValue([
      { id: "codex", name: "Codex CLI", available: true, pathSource: "configured" },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(mocks.listAgents).toHaveBeenCalledWith(agentCliEnv);
    expect(mocks.updateSettings).not.toHaveBeenCalled();
    expect(json.agents[0]).toMatchObject({ id: "codex", available: true, pathSource: "configured" });
  });

  it("auto-selects the first available agent when the saved agent is missing", async () => {
    mocks.getSettings.mockResolvedValue({ agentId: "gemini", agentCliEnv: {} });
    mocks.listAgents.mockResolvedValue([
      { id: "claude", name: "Claude Code", available: true },
      { id: "gemini", name: "Gemini CLI", available: false },
    ]);

    const response = await GET();
    await response.json();

    expect(mocks.updateSettings).toHaveBeenCalledWith({ agentId: "claude" });
  });
});
