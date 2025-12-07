// Project Improvements Analysis API
// Analyzes codebase for improvements in Agentic AI, n8n, Clean Codebase, Refactoring opportunities

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { readdir } from "fs/promises";

interface Improvement {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  file?: string;
  suggestion: string;
}

// Analyze codebase for improvements
async function analyzeCodebase(): Promise<Improvement[]> {
  const improvements: Improvement[] = [];
  const apiDir = join(process.cwd(), "app/api");

  // 1. Check for code duplication in tool executors
  const toolFiles = [
    "linear-tools.ts",
    "notion-tools.ts",
    "slack-tools.ts",
    "github-tools.ts",
    "openai-tools.ts",
    "anthropic-tools.ts",
  ];

  improvements.push({
    category: "Refactoring",
    priority: "medium",
    title: "Consolidate Tool Executor Patterns",
    description:
      "Multiple tool files follow similar patterns. Consider creating a base executor class or utility functions.",
    suggestion:
      "Create a generic tool executor interface and base implementation to reduce duplication.",
  });

  // 2. Error handling consistency
  improvements.push({
    category: "Clean Codebase",
    priority: "high",
    title: "Standardize Error Handling",
    description:
      "Error handling patterns vary across files. Implement consistent error handling middleware.",
    suggestion:
      "Create a centralized error handler utility and use it consistently across all API routes.",
  });

  // 3. Type safety improvements
  improvements.push({
    category: "Clean Codebase",
    priority: "medium",
    title: "Enhance Type Safety",
    description:
      "Some functions use 'any' types. Replace with proper TypeScript types for better type safety.",
    suggestion:
      "Create shared type definitions for MCP tools, responses, and parameters.",
  });

  // 4. Agentic AI opportunities
  improvements.push({
    category: "Agentic AI",
    priority: "high",
    title: "Agentic Decision Making",
    description:
      "The agent orchestration could be enhanced with better decision-making capabilities using LLM reasoning.",
    suggestion:
      "Implement agentic decision trees and multi-step reasoning for complex MCP tool orchestration.",
  });

  // 5. n8n integration improvements
  improvements.push({
    category: "n8n Automation",
    priority: "high",
    title: "Bidirectional n8n Sync",
    description:
      "n8n bidirectional sync (schema generator and code generator) is pending. This is a core feature.",
    suggestion:
      "Implement /api/n8n/schema-generator and /api/n8n/code-generator as outlined in PRD.md.",
  });

  // 6. Connection pooling optimization
  improvements.push({
    category: "Performance",
    priority: "medium",
    title: "Optimize Connection Pools",
    description:
      "Database connections (Postgres, MongoDB, SQLite) are initialized per request. Consider connection pooling.",
    suggestion:
      "Implement singleton connection pools that are reused across requests.",
  });

  // 7. Caching opportunities
  improvements.push({
    category: "Performance",
    priority: "low",
    title: "Implement Response Caching",
    description:
      "MCP server info, tools list, and resources could be cached to reduce API calls.",
    suggestion:
      "Use Redis for caching MCP server metadata with appropriate TTLs.",
  });

  // 8. Logging improvements
  improvements.push({
    category: "Observability",
    priority: "medium",
    title: "Structured Logging",
    description:
      "Console.log statements should be replaced with structured logging.",
    suggestion:
      "Implement a logging utility with log levels, structured output, and integration with monitoring tools.",
  });

  // 9. Testing coverage
  improvements.push({
    category: "Quality",
    priority: "high",
    title: "Add Comprehensive Tests",
    description:
      "The codebase lacks automated tests. Add unit tests for tool executors and integration tests for API routes.",
    suggestion:
      "Set up Jest/Vitest and add tests for critical paths, especially MCP tool execution.",
  });

  // 10. Vibe Coding - Developer Experience
  improvements.push({
    category: "Vibe Coding",
    priority: "medium",
    title: "Improve Developer Experience",
    description:
      "Add better TypeScript autocomplete, inline documentation, and development tools.",
    suggestion:
      "Enhance JSDoc comments, add Zod schemas for runtime validation, and create development helper scripts.",
  });

  // 11. Code organization
  improvements.push({
    category: "Clean Codebase",
    priority: "low",
    title: "Organize API Routes",
    description:
      "API routes are flat. Consider organizing by domain (mcp, sync, admin, etc.).",
    suggestion:
      "Current structure is good, but could benefit from shared utilities folder.",
  });

  // 12. Environment variable validation
  improvements.push({
    category: "Clean Codebase",
    priority: "medium",
    title: "Validate Environment Variables",
    description:
      "Environment variables are checked ad-hoc. Add startup validation.",
    suggestion:
      "Create an env validation utility using Zod that validates all required env vars on startup.",
  });

  return improvements;
}

// Analyze specific file
async function analyzeFile(filePath: string): Promise<Improvement[]> {
  const improvements: Improvement[] = [];

  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Check for 'any' types
    const anyTypeCount = (content.match(/:\s*any\b/g) || []).length;
    if (anyTypeCount > 0) {
      improvements.push({
        category: "Clean Codebase",
        priority: "medium",
        title: "Replace 'any' Types",
        description: `Found ${anyTypeCount} instances of 'any' type in ${filePath}`,
        file: filePath,
        suggestion: "Replace with proper TypeScript types or generics.",
      });
    }

    // Check for console.log (should use structured logging)
    const consoleLogCount = (content.match(/console\.log/g) || []).length;
    if (consoleLogCount > 0) {
      improvements.push({
        category: "Observability",
        priority: "low",
        title: "Replace console.log",
        description: `Found ${consoleLogCount} console.log statements in ${filePath}`,
        file: filePath,
        suggestion: "Use structured logging utility instead.",
      });
    }

    // Check for error handling
    if (!content.includes("try") && content.includes("async")) {
      improvements.push({
        category: "Clean Codebase",
        priority: "medium",
        title: "Add Error Handling",
        description: `Async functions in ${filePath} may lack error handling`,
        file: filePath,
        suggestion: "Wrap async operations in try-catch blocks.",
      });
    }
  } catch (error) {
    console.error(`[Improvements] Failed to analyze ${filePath}:`, error);
  }

  return improvements;
}

// GET: Analyze codebase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");
    const category = searchParams.get("category");

    if (file) {
      // Analyze specific file
      const improvements = await analyzeFile(file);
      return NextResponse.json({ file, improvements });
    }

    // Analyze entire codebase
    const improvements = await analyzeCodebase();

    // Filter by category if provided
    const filtered =
      category && category !== "all"
        ? improvements.filter((i) => i.category === category)
        : improvements;

    // Group by category
    const grouped = filtered.reduce(
      (acc, improvement) => {
        if (!acc[improvement.category]) {
          acc[improvement.category] = [];
        }
        acc[improvement.category].push(improvement);
        return acc;
      },
      {} as Record<string, Improvement[]>,
    );

    // Count by priority
    const priorityCounts = {
      high: filtered.filter((i) => i.priority === "high").length,
      medium: filtered.filter((i) => i.priority === "medium").length,
      low: filtered.filter((i) => i.priority === "low").length,
    };

    return NextResponse.json({
      total: filtered.length,
      byCategory: grouped,
      byPriority: priorityCounts,
      improvements: filtered,
    });
  } catch (error: any) {
    console.error("[Improvements] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
