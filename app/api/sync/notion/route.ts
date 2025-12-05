// Notion Sync API - Bidirectional sync between PRD.md and Notion Portfolio page
// Syncs PRD.md content to Notion page and vice versa

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { Client as NotionClient } from "@notionhq/client";
import { executeNotionTool } from "../../notion-tools";

const PRD_PATH = join(process.cwd(), "PRD.md");

// Get Notion client
function getNotionClient(): NotionClient | null {
  if (!process.env.NOTION_API_KEY) {
    return null;
  }
  return new NotionClient({ auth: process.env.NOTION_API_KEY });
}

// Read PRD.md
async function readPRD(): Promise<string> {
  try {
    return await fs.readFile(PRD_PATH, "utf-8");
  } catch (error) {
    console.error("[Notion Sync] Failed to read PRD.md:", error);
    throw error;
  }
}

// Convert markdown to Notion blocks
function markdownToNotionBlocks(markdown: string): any[] {
  const lines = markdown.split("\n");
  const blocks: any[] = [];
  let currentParagraph: string[] = [];

  for (const line of lines) {
    // Headers
    if (line.startsWith("# ")) {
      if (currentParagraph.length > 0) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content: currentParagraph.join("\n") } },
            ],
          },
        });
        currentParagraph = [];
      }
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [
            { type: "text", text: { content: line.substring(2).trim() } },
          ],
        },
      });
    } else if (line.startsWith("## ")) {
      if (currentParagraph.length > 0) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content: currentParagraph.join("\n") } },
            ],
          },
        });
        currentParagraph = [];
      }
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            { type: "text", text: { content: line.substring(3).trim() } },
          ],
        },
      });
    } else if (line.startsWith("### ")) {
      if (currentParagraph.length > 0) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content: currentParagraph.join("\n") } },
            ],
          },
        });
        currentParagraph = [];
      }
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [
            { type: "text", text: { content: line.substring(4).trim() } },
          ],
        },
      });
    } else if (line.trim() === "") {
      if (currentParagraph.length > 0) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content: currentParagraph.join("\n") } },
            ],
          },
        });
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(line);
    }
  }

  if (currentParagraph.length > 0) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: currentParagraph.join("\n") } },
        ],
      },
    });
  }

  return blocks;
}

// Convert Notion blocks to markdown
async function notionBlocksToMarkdown(pageId: string): Promise<string> {
  const client = getNotionClient();
  if (!client) throw new Error("Notion client not configured");

  const children = await executeNotionTool(client, "listPageChildren", {
    pageId,
    pageSize: 100,
  });
  const lines: string[] = [];

  for (const block of children.results || []) {
    if (block.type === "heading_1") {
      const text = block.heading_1?.rich_text?.[0]?.plain_text || "";
      lines.push(`# ${text}`);
    } else if (block.type === "heading_2") {
      const text = block.heading_2?.rich_text?.[0]?.plain_text || "";
      lines.push(`## ${text}`);
    } else if (block.type === "heading_3") {
      const text = block.heading_3?.rich_text?.[0]?.plain_text || "";
      lines.push(`### ${text}`);
    } else if (block.type === "paragraph") {
      const text = block.paragraph?.rich_text?.[0]?.plain_text || "";
      if (text) lines.push(text);
    }
    lines.push(""); // Empty line between blocks
  }

  return lines.join("\n");
}

// Sync PRD.md → Notion
export async function POST(request: NextRequest) {
  try {
    const { direction = "prd-to-notion", pageId } = await request
      .json()
      .catch(() => ({}));

    if (!pageId) {
      return NextResponse.json(
        { error: "Notion pageId required" },
        { status: 400 }
      );
    }

    const client = getNotionClient();
    if (!client) {
      return NextResponse.json(
        { error: "Notion API key not configured" },
        { status: 400 }
      );
    }

    if (direction === "prd-to-notion") {
      // Read PRD.md
      const prdContent = await readPRD();
      const blocks = markdownToNotionBlocks(prdContent);

      // Get existing page children
      const existingChildren = await executeNotionTool(
        client,
        "listPageChildren",
        { pageId, pageSize: 100 }
      );

      // Delete existing blocks
      for (const block of existingChildren.results || []) {
        try {
          await executeNotionTool(client, "deleteBlock", { blockId: block.id });
        } catch (error) {
          console.warn(
            `[Notion Sync] Failed to delete block ${block.id}:`,
            error
          );
        }
      }

      // Append new blocks in chunks (Notion has limits)
      const chunkSize = 100;
      for (let i = 0; i < blocks.length; i += chunkSize) {
        const chunk = blocks.slice(i, i + chunkSize);
        await executeNotionTool(client, "appendBlock", {
          blockId: pageId,
          children: chunk,
        });
      }

      return NextResponse.json({
        success: true,
        direction: "prd-to-notion",
        blocksCount: blocks.length,
        pageId,
      });
    } else if (direction === "notion-to-prd") {
      // Sync Notion → PRD.md
      const markdown = await notionBlocksToMarkdown(pageId);
      await fs.writeFile(PRD_PATH, markdown, "utf-8");

      return NextResponse.json({
        success: true,
        direction: "notion-to-prd",
        linesCount: markdown.split("\n").length,
        pageId,
      });
    }

    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  } catch (error: any) {
    console.error("[Notion Sync] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    const client = getNotionClient();
    if (!client) {
      return NextResponse.json({
        prd: { exists: true },
        notion: { connected: false },
      });
    }

    const prdContent = await readPRD();
    const prdStats = {
      exists: true,
      size: prdContent.length,
      lines: prdContent.split("\n").length,
      sections: (prdContent.match(/^##/gm) || []).length,
    };

    if (!pageId) {
      return NextResponse.json({
        prd: prdStats,
        notion: { connected: true, pageId: null },
      });
    }

    // Get Notion page info
    try {
      const page = await executeNotionTool(client, "getPage", { pageId });
      const children = await executeNotionTool(client, "listPageChildren", {
        pageId,
        pageSize: 100,
      });

      return NextResponse.json({
        prd: prdStats,
        notion: {
          connected: true,
          pageId,
          pageTitle:
            (page as any).properties?.title?.title?.[0]?.plain_text ||
            "Untitled",
          blocksCount: children.results?.length || 0,
        },
        sync: {
          synced: true,
          lastSync: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      return NextResponse.json({
        prd: prdStats,
        notion: {
          connected: true,
          pageId,
          error: error.message,
        },
      });
    }
  } catch (error: any) {
    console.error("[Notion Sync] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
