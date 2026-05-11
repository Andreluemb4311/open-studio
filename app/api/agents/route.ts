import { NextResponse } from "next/server";
import { listAgents } from "@/lib/daemon/agents";
import { getSettings, updateSettings } from "@/lib/storage/settings";

export async function GET() {
  const settings = await getSettings();
  const agents = await listAgents(settings.agentCliEnv);
  const selected = settings.agentId ? agents.find((agent) => agent.id === settings.agentId) : undefined;
  const firstAvailable = agents.find((agent) => agent.available);
  if (firstAvailable && (!settings.agentId || selected?.available === false)) {
    await updateSettings({ agentId: firstAvailable.id });
  }
  return NextResponse.json({ ok: true, agents });
}
