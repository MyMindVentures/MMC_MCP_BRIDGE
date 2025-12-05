import { NextResponse } from "next/server";
import { MCP_SERVERS } from "../mcp-config";
import { getN8NCommunityTools } from "../n8n/proxy";

// Helper to get n8n tools dynamically
async function getN8NTools() {
  try {
    const tools = await getN8NCommunityTools();
    return tools.map((t: any) => ({
      name: t.name,
      description: t.description || t.name,
    }));
  } catch (error) {
    console.error("[servers] Failed to load n8n tools:", error);
    return [];
  }
}

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter((s) => s.enabled);

  // Get n8n tools dynamically if n8n server is enabled
  const n8nServer = enabledServers.find((s) => s.name === "n8n");
  let n8nTools: any[] = [];
  if (n8nServer) {
    n8nTools = await getN8NTools();
  }

  return NextResponse.json({
    servers: enabledServers.map((s) => {
      // Use dynamic tools for n8n, static tools for others
      const tools =
        s.name === "n8n"
          ? n8nTools
          : s.tools.map((t) => ({ name: t.name, description: t.description }));

      return {
        name: s.name,
        category: s.category,
        tools: tools,
        resources:
          s.resources?.map((r) => ({
            uri: r.uri,
            name: r.name,
            description: r.description,
          })) || [],
        prompts:
          s.prompts?.map((p) => ({
            name: p.name,
            description: p.description,
          })) || [],
        supportsSampling: s.supportsSampling || false,
        hasGraphQL: !!s.graphql,
      };
    }),
  });
}
