// Sync Test API - Test and validate sync functionality
// Useful for debugging and validation

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

const TASKLIST_PATH = join(process.cwd(), "Tasklist.prd");
const PRD_PATH = join(process.cwd(), "PRD.md");

// Test Linear sync configuration
async function testLinearConfig() {
  const results: any = {
    linearApiKey: !!process.env.LINEAR_API_KEY,
    mcpBridgeUrl: process.env.MCP_BRIDGE_URL || "http://localhost:3000",
    mcpBridgeApiKey: !!process.env.MCP_BRIDGE_API_KEY,
  };

  // Test Linear connection
  try {
    const { executeLinearTool } = await import("../../linear-tools");
    const teams = await executeLinearTool("listTeams", {});
    results.linearConnected = true;
    results.linearTeams = teams?.length || 0;
  } catch (error: any) {
    results.linearConnected = false;
    results.linearError = error.message;
  }

  return results;
}

// Test Notion sync configuration
async function testNotionConfig() {
  const results: any = {
    notionApiKey: !!process.env.NOTION_API_KEY,
    notionPrdPageId: !!process.env.NOTION_PRD_PAGE_ID,
  };

  // Test Notion connection
  try {
    const { Client: NotionClient } = await import("@notionhq/client");
    if (process.env.NOTION_API_KEY) {
      const client = new NotionClient({ auth: process.env.NOTION_API_KEY });
      const me = await client.users.me({});
      results.notionConnected = true;
      results.notionUser = me.name || me.id;
    } else {
      results.notionConnected = false;
      results.notionError = "NOTION_API_KEY not configured";
    }
  } catch (error: any) {
    results.notionConnected = false;
    results.notionError = error.message;
  }

  return results;
}

// Test file accessibility
async function testFiles() {
  const results: any = {};

  // Test Tasklist.prd
  try {
    const tasklistContent = await fs.readFile(TASKLIST_PATH, "utf-8");
    const tasklistLines = tasklistContent.split("\n").filter((l) => l.trim());
    results.tasklist = {
      exists: true,
      size: tasklistContent.length,
      lines: tasklistLines.length,
      todos: tasklistLines.filter((l) => l.match(/^[✅🔄⏳]/)).length,
    };
  } catch (error: any) {
    results.tasklist = {
      exists: false,
      error: error.message,
    };
  }

  // Test PRD.md
  try {
    const prdContent = await fs.readFile(PRD_PATH, "utf-8");
    results.prd = {
      exists: true,
      size: prdContent.length,
      lines: prdContent.split("\n").length,
      sections: (prdContent.match(/^##/gm) || []).length,
    };
  } catch (error: any) {
    results.prd = {
      exists: false,
      error: error.message,
    };
  }

  return results;
}

// Test Redis connection
async function testRedis() {
  const results: any = {
    redisUrl: !!process.env.REDIS_URL,
  };

  if (process.env.REDIS_URL) {
    try {
      const { Redis } = await import("ioredis");
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 5000,
      });

      await redis.ping();
      results.redisConnected = true;

      // Test config storage
      await redis.set("sync:test", JSON.stringify({ test: true }));
      const testValue = await redis.get("sync:test");
      results.redisWorking = testValue !== null;
      await redis.del("sync:test");

      redis.disconnect();
    } catch (error: any) {
      results.redisConnected = false;
      results.redisError = error.message;
    }
  } else {
    results.redisConnected = false;
    results.redisError = "REDIS_URL not configured";
  }

  return results;
}

// Test sync endpoints
async function testEndpoints() {
  const baseUrl = process.env.MCP_BRIDGE_URL || "http://localhost:3000";
  const apiKey = process.env.MCP_BRIDGE_API_KEY;

  const results: any = {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  // Test Linear sync status
  try {
    const response = await fetch(`${baseUrl}/api/sync/linear`, {
      method: "GET",
      headers,
    });
    results.linearSyncStatus = response.ok;
    if (response.ok) {
      results.linearSyncData = await response.json();
    } else {
      results.linearSyncError = await response.text();
    }
  } catch (error: any) {
    results.linearSyncStatus = false;
    results.linearSyncError = error.message;
  }

  // Test Notion sync status
  try {
    const response = await fetch(
      `${baseUrl}/api/sync/notion?pageId=${process.env.NOTION_PRD_PAGE_ID || ""}`,
      {
        method: "GET",
        headers,
      },
    );
    results.notionSyncStatus = response.ok;
    if (response.ok) {
      results.notionSyncData = await response.json();
    } else {
      results.notionSyncError = await response.text();
    }
  } catch (error: any) {
    results.notionSyncStatus = false;
    results.notionSyncError = error.message;
  }

  // Test scheduler status
  try {
    const response = await fetch(`${baseUrl}/api/sync/scheduler`, {
      method: "GET",
      headers,
    });
    results.schedulerStatus = response.ok;
    if (response.ok) {
      results.schedulerData = await response.json();
    } else {
      results.schedulerError = await response.text();
    }
  } catch (error: any) {
    results.schedulerStatus = false;
    results.schedulerError = error.message;
  }

  return results;
}

// GET: Run all tests
export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      linear: await testLinearConfig(),
      notion: await testNotionConfig(),
      files: await testFiles(),
      redis: await testRedis(),
      endpoints: await testEndpoints(),
    };

    // Calculate overall health
    const health = {
      linear: results.linear.linearConnected && results.linear.linearApiKey,
      notion: results.notion.notionConnected && results.notion.notionApiKey,
      files: results.files.tasklist?.exists && results.files.prd?.exists,
      redis: results.redis.redisConnected || !process.env.REDIS_URL,
      endpoints:
        results.endpoints.linearSyncStatus &&
        results.endpoints.notionSyncStatus &&
        results.endpoints.schedulerStatus,
    };

    const allHealthy =
      health.linear &&
      health.notion &&
      health.files &&
      health.redis &&
      health.endpoints;

    return NextResponse.json({
      healthy: allHealthy,
      health,
      results,
    });
  } catch (error: any) {
    console.error("[Sync Test] Error:", error);
    return NextResponse.json(
      {
        healthy: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
