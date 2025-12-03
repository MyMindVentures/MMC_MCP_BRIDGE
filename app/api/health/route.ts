import { NextResponse } from 'next/server';
import { MCP_SERVERS } from '../../../lib/mcp-servers';

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mmc-mcp-bridge',
    version: '2.0.0',
    mcp_protocol: 'full',
    servers: {
      total: Object.keys(MCP_SERVERS).length,
      enabled: enabledServers.length,
      list: enabledServers.map(s => s.name)
    },
    features: {
      tools: true,
      resources: true,
      prompts: true,
      sampling: true,
      graphql: true
    }
  });
}

