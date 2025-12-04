import { NextResponse } from 'next/server';
import { MCP_SERVERS } from '../mcp-config';

// Initialize agentic worker on first health check
let workerInitialized = false;
if (!workerInitialized && process.env.REDIS_URL) {
  import('../agent/init').then(() => {
    workerInitialized = true;
    console.log('[Health] Agentic worker started');
  }).catch(err => {
    console.error('[Health] Failed to start worker:', err.message);
  });
}

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'mmc-mcp-bridge',
    version: '2.0.0',
    mcp_protocol: 'full',
    agent: {
      enabled: !!process.env.REDIS_URL,
      status: workerInitialized ? 'running' : 'initializing'
    },
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
      graphql: true,
      autonomous_agent: !!process.env.REDIS_URL
    }
  });
}

