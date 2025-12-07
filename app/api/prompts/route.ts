import { NextResponse } from "next/server";
import { MCP_SERVERS } from "../mcp-config";

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter((s) => s.enabled);
  const allPrompts = enabledServers.flatMap((s) =>
    (s.prompts || []).map((p) => ({ ...p, server: s.name })),
  );
  return NextResponse.json({ prompts: allPrompts });
}
