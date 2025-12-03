import { NextResponse } from 'next/server';
import { MCP_SERVERS } from '../../../lib/mcp-servers';

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
  const allResources = enabledServers.flatMap(s => 
    (s.resources || []).map(r => ({ ...r, server: s.name }))
  );
  return NextResponse.json({ resources: allResources });
}

