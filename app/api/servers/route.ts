import { NextResponse } from 'next/server';
import { MCP_SERVERS } from '../../../lib/mcp-servers';

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
  return NextResponse.json({
    servers: enabledServers.map(s => ({
      name: s.name,
      category: s.category,
      tools: s.tools.map(t => ({ name: t.name, description: t.description })),
      resources: s.resources?.map(r => ({ uri: r.uri, name: r.name, description: r.description })) || [],
      prompts: s.prompts?.map(p => ({ name: p.name, description: p.description })) || [],
      supportsSampling: s.supportsSampling || false,
      hasGraphQL: !!s.graphql
    }))
  });
}

