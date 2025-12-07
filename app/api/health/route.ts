import { NextResponse } from "next/server";
import { MCP_SERVERS } from "../mcp-config";
import { appendFile } from "fs/promises";

// Debug logging helper (file-based fallback)
async function debugLog(data: any) {
  const logPath = process.cwd() + "/.cursor/debug.log";
  const logLine = JSON.stringify({ ...data, timestamp: Date.now() }) + "\n";
  try {
    // Ensure directory exists
    const { mkdir } = await import("fs/promises");
    try {
      await mkdir(process.cwd() + "/.cursor", { recursive: true });
    } catch {}
    await appendFile(logPath, logLine).catch((err) => {
      console.error("[Debug] Failed to write log:", err);
    });
    fetch("http://127.0.0.1:7242/ingest/030eea83-1f2d-447b-8780-b95a991da708", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch (err: any) {
    console.error("[Debug] Logging error:", err?.message);
  }
}

// Initialize agentic worker on first health check
let workerInitialized = false;
if (!workerInitialized && process.env.REDIS_URL) {
  import("../agent/init")
    .then(() => {
      workerInitialized = true;
      console.log("[Health] Agentic worker started");
    })
    .catch((err) => {
      console.error("[Health] Failed to start worker:", err.message);
    });
}

// Check connection status for various services
async function checkConnection(
  service: string,
  checkFn: () => Promise<boolean>,
): Promise<{ service: string; status: string; error?: string }> {
  try {
    const connected = await Promise.race([
      checkFn(),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000),
      ),
    ]);
    return { service, status: connected ? "connected" : "disconnected" };
  } catch (error: any) {
    return { service, status: "error", error: error.message };
  }
}

async function checkPostgres(): Promise<boolean> {
  // #region agent log
  await debugLog({
    location: "health/route.ts:35",
    message: "checkPostgres entry",
    data: { hasEnvVar: !!process.env.POSTGRES_CONNECTION_STRING },
    sessionId: "debug-session",
    runId: "run1",
    hypothesisId: "C",
  });
  // #endregion agent log
  if (!process.env.POSTGRES_CONNECTION_STRING) return false;
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.POSTGRES_CONNECTION_STRING,
    });
    const result = await pool.query("SELECT 1");
    await pool.end();
    // #region agent log
    await debugLog({
      location: "health/route.ts:43",
      message: "checkPostgres success",
      data: { hasResult: !!result },
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C",
    });
    // #endregion agent log
    return !!result;
  } catch (err: any) {
    // #region agent log
    await debugLog({
      location: "health/route.ts:46",
      message: "checkPostgres error",
      data: { errorMessage: err?.message },
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C",
    });
    // #endregion agent log
    return false;
  }
}

async function checkMongoDB(): Promise<boolean> {
  if (!process.env.MONGODB_CONNECTION_STRING) return false;
  try {
    const { MongoClient } = await import("mongodb");
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
  // #region agent log
  await debugLog({
    location: "health/route.ts:64",
    message: "checkRedis entry",
    data: { hasEnvVar: !!process.env.REDIS_URL },
    sessionId: "debug-session",
    runId: "run1",
    hypothesisId: "C",
  });
  // #endregion agent log
  if (!process.env.REDIS_URL) return false;
  try {
    const { Redis } = await import("ioredis");
    const redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
    redis.disconnect();
    // #region agent log
    await debugLog({
      location: "health/route.ts:70",
      message: "checkRedis success",
      data: {},
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C",
    });
    // #endregion agent log
    return true;
  } catch (err: any) {
    // #region agent log
    await debugLog({
      location: "health/route.ts:73",
      message: "checkRedis error",
      data: { errorMessage: err?.message },
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C",
    });
    // #endregion agent log
    return false;
  }
}

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter((s) => s.enabled);

  // Check connections in parallel
  const [postgres, mongodb, redis] = await Promise.all([
    checkConnection("postgres", checkPostgres),
    checkConnection("mongodb", checkMongoDB),
    checkConnection("redis", checkRedis),
  ]);

  // Calculate MCP server statistics
  const totalTools = enabledServers.reduce((sum, s) => sum + s.tools.length, 0);
  const totalResources = enabledServers.reduce(
    (sum, s) => sum + (s.resources?.length || 0),
    0,
  );
  const totalPrompts = enabledServers.reduce(
    (sum, s) => sum + (s.prompts?.length || 0),
    0,
  );
  const serversWithSampling = enabledServers.filter(
    (s) => s.supportsSampling,
  ).length;
  const serversWithGraphQL = enabledServers.filter((s) => s.graphql).length;

  // Determine overall health
  // A connection is healthy if: connected OR (error but service not configured)
  const connectionsHealthy = [postgres, mongodb, redis].every((c) => {
    if (c.status === "connected") return true;
    if (c.status === "error") {
      // Check if service is configured - if not configured, error is acceptable
      const envVarName =
        c.service === "postgres"
          ? "POSTGRES_CONNECTION_STRING"
          : c.service === "mongodb"
            ? "MONGODB_CONNECTION_STRING"
            : c.service === "redis"
              ? "REDIS_URL"
              : null;
      return envVarName ? !process.env[envVarName] : false;
    }
    return false; // disconnected means unhealthy
  });

  return NextResponse.json({
    status: connectionsHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    service: "mmc-mcp-bridge",
    version: "2.0.0",
    mcp_protocol: "full",
    agent: {
      enabled: !!process.env.REDIS_URL,
      status: workerInitialized
        ? "running"
        : process.env.REDIS_URL
          ? "initializing"
          : "disabled",
    },
    servers: {
      total: Object.keys(MCP_SERVERS).length,
      enabled: enabledServers.length,
      list: enabledServers.map((s) => s.name),
      statistics: {
        totalTools,
        totalResources,
        totalPrompts,
        serversWithSampling,
        serversWithGraphQL,
      },
      byCategory: enabledServers.reduce(
        (acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    },
    connections: {
      postgres: {
        configured: !!process.env.POSTGRES_CONNECTION_STRING,
        ...postgres,
      },
      mongodb: {
        configured: !!process.env.MONGODB_CONNECTION_STRING,
        ...mongodb,
      },
      redis: {
        configured: !!process.env.REDIS_URL,
        ...redis,
      },
    },
    features: {
      tools: true,
      resources: true,
      prompts: true,
      sampling: serversWithSampling > 0,
      graphql: serversWithGraphQL > 0,
      autonomous_agent: !!process.env.REDIS_URL,
    },
  });
}
