export type AgentCliEnv = Record<string, Record<string, string>>;

export const AGENT_CLI_ENV_KEYS: Record<string, readonly string[]> = {
  claude: ["CLAUDE_CONFIG_DIR", "CLAUDE_BIN"],
  codex: ["CODEX_HOME", "CODEX_BIN"],
  copilot: ["COPILOT_BIN"],
  "cursor-agent": ["CURSOR_AGENT_BIN"],
  deepseek: ["DEEPSEEK_BIN"],
  devin: ["DEVIN_BIN"],
  gemini: ["GEMINI_BIN"],
  hermes: ["HERMES_BIN"],
  kimi: ["KIMI_BIN"],
  kiro: ["KIRO_BIN"],
  kilo: ["KILO_BIN"],
  opencode: ["OPENCODE_BIN"],
  pi: ["PI_BIN"],
  qoder: ["QODER_BIN"],
  qwen: ["QWEN_BIN"],
  vibe: ["VIBE_BIN"],
};

export const AGENT_BIN_ENV_KEYS: Record<string, string> = Object.fromEntries(
  Object.entries(AGENT_CLI_ENV_KEYS)
    .map(([agentId, keys]) => [agentId, keys.find((key) => key.endsWith("_BIN"))])
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
);

export function sanitizeAgentCliEnv(raw: unknown): AgentCliEnv {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const result: AgentCliEnv = {};
  for (const [agentId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (agentId === "__proto__" || agentId === "constructor") continue;
    const allowed = AGENT_CLI_ENV_KEYS[agentId];
    if (!allowed || !value || typeof value !== "object" || Array.isArray(value)) continue;

    const env: Record<string, string> = {};
    for (const [envKey, envValue] of Object.entries(value as Record<string, unknown>)) {
      if (!allowed.includes(envKey)) continue;
      if (typeof envValue !== "string") continue;
      const trimmed = envValue.trim();
      if (trimmed) env[envKey] = trimmed;
    }

    if (Object.keys(env).length > 0) result[agentId] = env;
  }

  return result;
}

export function agentCliEnvForAgent(prefs: AgentCliEnv | undefined, agentId: string): Record<string, string> {
  if (!prefs || !agentId) return {};
  return { ...(prefs[agentId] ?? {}) };
}
