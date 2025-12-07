// Sync Scheduler API - Automatic periodic sync between Tasklist.prd/PRD.md and Linear/Notion
// Supports cron-like scheduling via Railway cron jobs or manual triggers

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "ioredis";

// Redis connection helper
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  try {
    return new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  } catch {
    return null;
  }
}

// Sync configuration
interface SyncConfig {
  linear: {
    enabled: boolean;
    interval: number; // minutes
    direction: "tasklist-to-linear" | "linear-to-tasklist" | "bidirectional";
    lastSync?: string;
  };
  notion: {
    enabled: boolean;
    interval: number; // minutes
    direction: "prd-to-notion" | "notion-to-prd" | "bidirectional";
    pageId?: string;
    lastSync?: string;
  };
}

const DEFAULT_CONFIG: SyncConfig = {
  linear: {
    enabled: true,
    interval: 15, // Sync every 15 minutes
    direction: "bidirectional",
  },
  notion: {
    enabled: true,
    interval: 30, // Sync every 30 minutes
    direction: "bidirectional",
    pageId: process.env.NOTION_PRD_PAGE_ID,
  },
};

// Get sync config from Redis
async function getSyncConfig(): Promise<SyncConfig> {
  const redis = getRedis();
  if (!redis) return DEFAULT_CONFIG;

  try {
    const configStr = await redis.get("sync:config");
    if (configStr) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(configStr) };
    }
  } catch (error) {
    console.error("[Sync Scheduler] Failed to get config:", error);
  }

  return DEFAULT_CONFIG;
}

// Save sync config to Redis
async function saveSyncConfig(config: SyncConfig): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set("sync:config", JSON.stringify(config));
  } catch (error) {
    console.error("[Sync Scheduler] Failed to save config:", error);
  }
}

// Execute Linear sync
async function executeLinearSync(direction: string) {
  try {
    const baseUrl = process.env.MCP_BRIDGE_URL || "http://localhost:3000";
    const apiKey = process.env.MCP_BRIDGE_API_KEY;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    if (direction === "bidirectional") {
      // First sync Tasklist → Linear
      const response1 = await fetch(`${baseUrl}/api/sync/linear`, {
        method: "POST",
        headers,
        body: JSON.stringify({ direction: "tasklist-to-linear" }),
      });

      if (!response1.ok) {
        const error = await response1.text();
        throw new Error(`Tasklist → Linear sync failed: ${error}`);
      }

      // Then sync Linear → Tasklist
      const response2 = await fetch(`${baseUrl}/api/sync/linear`, {
        method: "POST",
        headers,
        body: JSON.stringify({ direction: "linear-to-tasklist" }),
      });

      if (!response2.ok) {
        const error = await response2.text();
        throw new Error(`Linear → Tasklist sync failed: ${error}`);
      }

      const result1 = await response1.json();
      const result2 = await response2.json();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        tasklistToLinear: result1,
        linearToTasklist: result2,
      };
    } else {
      const response = await fetch(`${baseUrl}/api/sync/linear`, {
        method: "POST",
        headers,
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Linear sync failed: ${error}`);
      }

      const result = await response.json();
      return { success: true, timestamp: new Date().toISOString(), result };
    }
  } catch (error: any) {
    console.error("[Sync Scheduler] Linear sync failed:", error);
    return { success: false, error: error.message };
  }
}

// Execute Notion sync
async function executeNotionSync(direction: string, pageId?: string) {
  try {
    const baseUrl = process.env.MCP_BRIDGE_URL || "http://localhost:3000";
    const apiKey = process.env.MCP_BRIDGE_API_KEY;
    const targetPageId = pageId || process.env.NOTION_PRD_PAGE_ID;

    if (!targetPageId) {
      throw new Error("Notion pageId not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    if (direction === "bidirectional") {
      // First sync PRD → Notion
      const response1 = await fetch(`${baseUrl}/api/sync/notion`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          direction: "prd-to-notion",
          pageId: targetPageId,
        }),
      });

      if (!response1.ok) {
        const error = await response1.text();
        throw new Error(`PRD → Notion sync failed: ${error}`);
      }

      // Then sync Notion → PRD
      const response2 = await fetch(`${baseUrl}/api/sync/notion`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          direction: "notion-to-prd",
          pageId: targetPageId,
        }),
      });

      if (!response2.ok) {
        const error = await response2.text();
        throw new Error(`Notion → PRD sync failed: ${error}`);
      }

      const result1 = await response1.json();
      const result2 = await response2.json();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        prdToNotion: result1,
        notionToPrd: result2,
      };
    } else {
      const response = await fetch(`${baseUrl}/api/sync/notion`, {
        method: "POST",
        headers,
        body: JSON.stringify({ direction, pageId: targetPageId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion sync failed: ${error}`);
      }

      const result = await response.json();
      return { success: true, timestamp: new Date().toISOString(), result };
    }
  } catch (error: any) {
    console.error("[Sync Scheduler] Notion sync failed:", error);
    return { success: false, error: error.message };
  }
}

// Check if sync is due
function isSyncDue(lastSync: string | undefined, interval: number): boolean {
  if (!lastSync) return true;
  const lastSyncTime = new Date(lastSync).getTime();
  const now = Date.now();
  const intervalMs = interval * 60 * 1000; // Convert minutes to ms
  return now - lastSyncTime >= intervalMs;
}

// Main sync execution
export async function POST(request: NextRequest) {
  try {
    const { force = false, service } = await request.json().catch(() => ({}));
    const config = await getSyncConfig();
    const results: any = {};

    // Linear sync
    if ((service === "linear" || !service) && config.linear.enabled) {
      if (force || isSyncDue(config.linear.lastSync, config.linear.interval)) {
        const result = await executeLinearSync(config.linear.direction);
        results.linear = result;
        if (result.success) {
          config.linear.lastSync = new Date().toISOString();
        }
      } else {
        results.linear = {
          skipped: true,
          reason: "Not due yet",
          nextSync: new Date(
            new Date(config.linear.lastSync || 0).getTime() +
              config.linear.interval * 60 * 1000,
          ).toISOString(),
        };
      }
    }

    // Notion sync
    if ((service === "notion" || !service) && config.notion.enabled) {
      if (force || isSyncDue(config.notion.lastSync, config.notion.interval)) {
        const result = await executeNotionSync(
          config.notion.direction,
          config.notion.pageId,
        );
        results.notion = result;
        if (result.success) {
          config.notion.lastSync = new Date().toISOString();
        }
      } else {
        results.notion = {
          skipped: true,
          reason: "Not due yet",
          nextSync: new Date(
            new Date(config.notion.lastSync || 0).getTime() +
              config.notion.interval * 60 * 1000,
          ).toISOString(),
        };
      }
    }

    // Save updated config
    await saveSyncConfig(config);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      config,
    });
  } catch (error: any) {
    console.error("[Sync Scheduler] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get sync status and configuration
export async function GET() {
  try {
    const config = await getSyncConfig();

    return NextResponse.json({
      config,
      status: {
        linear: {
          enabled: config.linear.enabled,
          lastSync: config.linear.lastSync || "Never",
          nextSync: config.linear.lastSync
            ? new Date(
                new Date(config.linear.lastSync).getTime() +
                  config.linear.interval * 60 * 1000,
              ).toISOString()
            : "Immediately",
          interval: `${config.linear.interval} minutes`,
        },
        notion: {
          enabled: config.notion.enabled,
          lastSync: config.notion.lastSync || "Never",
          nextSync: config.notion.lastSync
            ? new Date(
                new Date(config.notion.lastSync).getTime() +
                  config.notion.interval * 60 * 1000,
              ).toISOString()
            : "Immediately",
          interval: `${config.notion.interval} minutes`,
          pageId: config.notion.pageId || "Not configured",
        },
      },
    });
  } catch (error: any) {
    console.error("[Sync Scheduler] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update sync configuration
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const config = await getSyncConfig();

    if (updates.linear) {
      config.linear = { ...config.linear, ...updates.linear };
    }
    if (updates.notion) {
      config.notion = { ...config.notion, ...updates.notion };
    }

    await saveSyncConfig(config);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error("[Sync Scheduler] PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
