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

// Check connection status for various services
async function checkConnection(service: string, checkFn: () => Promise<boolean>): Promise<{ status: string; error?: string }> {
  try {
    const connected = await Promise.race([
      checkFn(),
      new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);
    return { status: connected ? 'connected' : 'disconnected' };
  } catch (error: any) {
    return { status: 'error', error: error.message };
  }
}

async function checkPostgres(): Promise<boolean> {
  if (!process.env.POSTGRES_CONNECTION_STRING) return false;
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_CONNECTION_STRING });
    const result = await pool.query('SELECT 1');
    await pool.end();
    return !!result;
  } catch {
    return false;
  }
}

async function checkMongoDB(): Promise<boolean> {
  if (!process.env.MONGODB_CONNECTION_STRING) return false;
  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  if (!process.env.REDIS_URL) return false;
  try {
    const { Redis } = await import('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
    redis.disconnect();
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
  
  // Check connections in parallel
  const [postgres, mongodb, redis] = await Promise.all([
    checkConnection('postgres', checkPostgres),
    checkConnection('mongodb', checkMongoDB),
    checkConnection('redis', checkRedis)
  ]);

  // Calculate MCP server statistics
  const totalTools = enabledServers.reduce((sum, s) => sum + s.tools.length, 0);
  const totalResources = enabledServers.reduce((sum, s) => sum + (s.resources?.length || 0), 0);
  const totalPrompts = enabledServers.reduce((sum, s) => sum + (s.prompts?.length || 0), 0);
  const serversWithSampling = enabledServers.filter(s => s.supportsSampling).length;
  const serversWithGraphQL = enabledServers.filter(s => s.graphql).length;

  // Determine overall health
  const connectionsHealthy = [postgres, mongodb, redis].every(c => 
    c.status === 'connected' || (c.status === 'error' && !process.env[`${c.status.toUpperCase()}_CONNECTION_STRING`])
  );
  
  return NextResponse.json({
    status: connectionsHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'mmc-mcp-bridge',
    version: '2.0.0',
    mcp_protocol: 'full',
    agent: {
      enabled: !!process.env.REDIS_URL,
      status: workerInitialized ? 'running' : (process.env.REDIS_URL ? 'initializing' : 'disabled')
    },
    servers: {
      total: Object.keys(MCP_SERVERS).length,
      enabled: enabledServers.length,
      list: enabledServers.map(s => s.name),
      statistics: {
        totalTools,
        totalResources,
        totalPrompts,
        serversWithSampling,
        serversWithGraphQL
      },
      byCategory: enabledServers.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    connections: {
      postgres: {
        configured: !!process.env.POSTGRES_CONNECTION_STRING,
        ...postgres
      },
      mongodb: {
        configured: !!process.env.MONGODB_CONNECTION_STRING,
        ...mongodb
      },
      redis: {
        configured: !!process.env.REDIS_URL,
        ...redis
      }
    },
    features: {
      tools: true,
      resources: true,
      prompts: true,
      sampling: serversWithSampling > 0,
      graphql: serversWithGraphQL > 0,
      autonomous_agent: !!process.env.REDIS_URL
    }
  });
}

