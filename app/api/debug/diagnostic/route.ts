// Diagnostic endpoint - Comprehensive system health check
// GET /api/debug/diagnostic

import { NextResponse } from "next/server";
import { MCP_SERVERS } from "../../mcp-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "not set",
      port: process.env.PORT || "not set",
      hasRedis: !!process.env.REDIS_URL,
      hasPostgres: !!process.env.POSTGRES_CONNECTION_STRING,
      hasMongoDB: !!process.env.MONGODB_CONNECTION_STRING,
      hasSQLite: !!process.env.SQLITE_DB_PATH,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      hasN8N: !!(process.env.N8N_INSTANCE_APIKEY || process.env.N8N_API_KEY),
    },
    mcpServers: {
      total: Object.keys(MCP_SERVERS).length,
      enabled: Object.values(MCP_SERVERS).filter((s) => s.enabled).length,
      servers: Object.values(MCP_SERVERS).map((s) => ({
        name: s.name,
        enabled: s.enabled,
        toolsCount: s.tools.length,
        resourcesCount: s.resources?.length || 0,
        promptsCount: s.prompts?.length || 0,
      })),
    },
    connections: {
      postgres: await testPostgres(),
      mongodb: await testMongoDB(),
      redis: await testRedis(),
      sqlite: await testSQLite(),
    },
    apiRoutes: {
      health: "/api/health",
      sse: "/api/sse",
      servers: "/api/servers",
      resources: "/api/resources",
      prompts: "/api/prompts",
      mcp: "/api/mcp/:server/:tool",
      agent: "/api/agent",
      debug: "/api/debug/diagnostic",
    },
  };

  return NextResponse.json(diagnostics, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}

async function testPostgres(): Promise<{
  configured: boolean;
  connected: boolean;
  error?: string;
}> {
  if (!process.env.POSTGRES_CONNECTION_STRING) {
    return { configured: false, connected: false };
  }
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.POSTGRES_CONNECTION_STRING,
      connectionTimeoutMillis: 2000,
    });
    await pool.query("SELECT 1");
    await pool.end();
    return { configured: true, connected: true };
  } catch (error: any) {
    return { configured: true, connected: false, error: error.message };
  }
}

async function testMongoDB(): Promise<{
  configured: boolean;
  connected: boolean;
  error?: string;
}> {
  if (!process.env.MONGODB_CONNECTION_STRING) {
    return { configured: false, connected: false };
  }
  try {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
      serverSelectionTimeoutMS: 2000,
    });
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    return { configured: true, connected: true };
  } catch (error: any) {
    return { configured: true, connected: false, error: error.message };
  }
}

async function testRedis(): Promise<{
  configured: boolean;
  connected: boolean;
  error?: string;
}> {
  if (!process.env.REDIS_URL) {
    return { configured: false, connected: false };
  }
  try {
    const { Redis } = await import("ioredis");
    const redis = new Redis(process.env.REDIS_URL, {
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
    });
    await redis.ping();
    redis.disconnect();
    return { configured: true, connected: true };
  } catch (error: any) {
    return { configured: true, connected: false, error: error.message };
  }
}

async function testSQLite(): Promise<{
  configured: boolean;
  accessible: boolean;
  error?: string;
}> {
  if (!process.env.SQLITE_DB_PATH) {
    return { configured: false, accessible: false };
  }
  try {
    const { promises: fs } = await import("fs");
    await fs.access(process.env.SQLITE_DB_PATH);
    return { configured: true, accessible: true };
  } catch (error: any) {
    return { configured: true, accessible: false, error: error.message };
  }
}
