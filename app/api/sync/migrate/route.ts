// Markdown Migration API - Migrate markdown files to Linear/Notion
// Analyzes markdown files and creates corresponding Linear issues or Notion pages

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { executeLinearTool } from "../../linear-tools";
import { Client as NotionClient } from "@notionhq/client";
import { executeNotionTool } from "../../notion-tools";

// Get Notion client
function getNotionClient(): NotionClient | null {
  if (!process.env.NOTION_API_KEY) return null;
  return new NotionClient({ auth: process.env.NOTION_API_KEY });
}

// Get Linear team ID
async function getLinearTeamId(): Promise<string | null> {
  try {
    const teams = await executeLinearTool("listTeams", {});
    return teams && teams.length > 0 ? teams[0].id : null;
  } catch {
    return null;
  }
}

// Parse markdown file and extract sections
function parseMarkdown(content: string): {
  title: string;
  sections: Array<{ level: number; title: string; content: string }>;
} {
  const lines = content.split("\n");
  const sections: Array<{ level: number; title: string; content: string }> = [];
  let currentSection: {
    level: number;
    title: string;
    content: string[];
  } | null = null;
  let title = lines[0]?.replace(/^#+\s*/, "") || "Untitled";

  for (const line of lines) {
    if (line.match(/^#{1,3}\s+/)) {
      // Save previous section
      if (currentSection) {
        sections.push({
          level: currentSection.level,
          title: currentSection.title,
          content: currentSection.content.join("\n"),
        });
      }

      // Start new section
      const level = line.match(/^#+/)?.[0].length || 1;
      const sectionTitle = line.replace(/^#+\s*/, "").trim();
      currentSection = { level, title: sectionTitle, content: [] };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      level: currentSection.level,
      title: currentSection.title,
      content: currentSection.content.join("\n"),
    });
  }

  return { title, sections };
}

// Migrate markdown to Linear issues
async function migrateToLinear(
  filePath: string,
  content: string
): Promise<any> {
  const teamId = await getLinearTeamId();
  if (!teamId) {
    throw new Error("No Linear team found");
  }

  const { title, sections } = parseMarkdown(content);
  const issues = [];

  // Create main issue for the document
  const mainIssue = await executeLinearTool("createIssue", {
    teamId,
    title: `${title} (${filePath})`,
    description: `Migrated from ${filePath}\n\n${sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n")}`,
    priority: 3,
  });
  issues.push({ type: "main", issue: mainIssue });

  // Create sub-issues for major sections
  for (const section of sections.filter((s) => s.level <= 2)) {
    const sectionIssue = await executeLinearTool("createIssue", {
      teamId,
      title: `${title} - ${section.title}`,
      description: section.content,
      priority: 3,
    });
    issues.push({ type: "section", issue: sectionIssue });
  }

  return { issues, count: issues.length };
}

// Migrate markdown to Notion page
async function migrateToNotion(
  filePath: string,
  content: string,
  parentPageId?: string
): Promise<any> {
  const client = getNotionClient();
  if (!client) {
    throw new Error("Notion API key not configured");
  }

  const { title, sections } = parseMarkdown(content);

  // Create main page
  const page = await executeNotionTool(client, "createPage", {
    parent: parentPageId
      ? { page_id: parentPageId }
      : { type: "workspace", workspace: true },
    properties: {
      title: {
        title: [{ type: "text", text: { content: `${title} (${filePath})` } }],
      },
    },
    children: sections.map((section) => {
      if (section.level === 1) {
        return {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: section.title } }],
          },
        };
      } else if (section.level === 2) {
        return {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: section.title } }],
          },
        };
      } else {
        return {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: section.content } }],
          },
        };
      }
    }),
  });

  return { page, pageId: page.id };
}

// List markdown files that can be migrated
async function listMigratableFiles(): Promise<
  Array<{ path: string; size: number; sections: number }>
> {
  const rootDir = process.cwd();
  const files: Array<{ path: string; size: number; sections: number }> = [];

  // Files to exclude (source of truth files)
  const excludeFiles = [
    "PRD.md",
    "Tasklist.prd",
    "README.md",
    "package.json",
    "package-lock.json",
  ];

  async function scanDir(dir: string, basePath: string = "") {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = join(basePath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await scanDir(fullPath, relativePath);
        } else if (
          entry.isFile() &&
          entry.name.endsWith(".md") &&
          !excludeFiles.includes(entry.name)
        ) {
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            const { sections } = parseMarkdown(content);
            files.push({
              path: relativePath,
              size: content.length,
              sections: sections.length,
            });
          } catch (error) {
            console.warn(`[Migration] Failed to read ${relativePath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`[Migration] Failed to scan ${dir}:`, error);
    }
  }

  await scanDir(rootDir);
  return files;
}

// POST: Migrate markdown files
export async function POST(request: NextRequest) {
  try {
    const {
      filePath,
      target = "both", // "linear", "notion", or "both"
      notionParentPageId,
    } = await request.json().catch(() => ({}));

    if (!filePath) {
      return NextResponse.json({ error: "filePath required" }, { status: 400 });
    }

    const fullPath = join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, "utf-8");

    const results: any = { filePath, target };

    // Migrate to Linear
    if (target === "linear" || target === "both") {
      try {
        results.linear = await migrateToLinear(filePath, content);
      } catch (error: any) {
        results.linear = { error: error.message };
      }
    }

    // Migrate to Notion
    if (target === "notion" || target === "both") {
      try {
        results.notion = await migrateToNotion(
          filePath,
          content,
          notionParentPageId
        );
      } catch (error: any) {
        results.notion = { error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("[Migration] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: List migratable files
export async function GET() {
  try {
    const files = await listMigratableFiles();

    return NextResponse.json({
      files,
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
    });
  } catch (error: any) {
    console.error("[Migration] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
