// Test endpoint for n8n integration
// GET /api/n8n/test - Test n8n MCP connection and tools

import { NextResponse } from "next/server";
import {
  getN8NCommunityTools,
  getN8NCommunityResources,
  getN8NCommunityPrompts,
  executeN8NCommunityTool,
} from "./proxy";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  // Test 1: Check if n8n client can be initialized
  try {
    const tools = await getN8NCommunityTools();
    results.tests.push({
      name: "Initialize n8n MCP Client",
      status: "passed",
      message: `Successfully connected to n8n MCP server`,
      data: {
        toolsCount: tools.length,
        toolNames: tools.slice(0, 10).map((t: any) => t.name),
      },
    });
    results.summary.passed++;
  } catch (error: any) {
    results.tests.push({
      name: "Initialize n8n MCP Client",
      status: "failed",
      message: error.message,
      error: error.stack,
    });
    results.summary.failed++;
  }
  results.summary.total++;

  // Test 2: List tools
  try {
    const tools = await getN8NCommunityTools();
    if (tools.length > 0) {
      results.tests.push({
        name: "List n8n Tools",
        status: "passed",
        message: `Found ${tools.length} tools`,
        data: {
          tools: tools.map((t: any) => ({
            name: t.name,
            description: t.description,
          })),
        },
      });
      results.summary.passed++;
    } else {
      results.tests.push({
        name: "List n8n Tools",
        status: "warning",
        message: "No tools found (n8n may not be configured)",
      });
      results.summary.passed++;
    }
  } catch (error: any) {
    results.tests.push({
      name: "List n8n Tools",
      status: "failed",
      message: error.message,
    });
    results.summary.failed++;
  }
  results.summary.total++;

  // Test 3: List resources
  try {
    const resources = await getN8NCommunityResources();
    results.tests.push({
      name: "List n8n Resources",
      status: "passed",
      message: `Found ${resources.length} resources`,
      data: {
        resources: resources.map((r: any) => ({
          uri: r.uri,
          name: r.name,
          description: r.description,
        })),
      },
    });
    results.summary.passed++;
  } catch (error: any) {
    results.tests.push({
      name: "List n8n Resources",
      status: "failed",
      message: error.message,
    });
    results.summary.failed++;
  }
  results.summary.total++;

  // Test 4: List prompts
  try {
    const prompts = await getN8NCommunityPrompts();
    results.tests.push({
      name: "List n8n Prompts",
      status: "passed",
      message: `Found ${prompts.length} prompts`,
      data: {
        prompts: prompts.map((p: any) => ({
          name: p.name,
          description: p.description,
        })),
      },
    });
    results.summary.passed++;
  } catch (error: any) {
    results.tests.push({
      name: "List n8n Prompts",
      status: "failed",
      message: error.message,
    });
    results.summary.failed++;
  }
  results.summary.total++;

  // Test 5: Try to execute listWorkflows (if available)
  try {
    const tools = await getN8NCommunityTools();
    const listWorkflowsTool = tools.find(
      (t: any) => t.name === "listWorkflows",
    );

    if (listWorkflowsTool) {
      const result = await executeN8NCommunityTool("listWorkflows", {});
      results.tests.push({
        name: "Execute listWorkflows",
        status: "passed",
        message: "Successfully executed listWorkflows",
        data: {
          resultType: typeof result,
          hasContent: !!result?.content,
        },
      });
      results.summary.passed++;
    } else {
      results.tests.push({
        name: "Execute listWorkflows",
        status: "skipped",
        message: "listWorkflows tool not available",
      });
    }
  } catch (error: any) {
    results.tests.push({
      name: "Execute listWorkflows",
      status: "failed",
      message: error.message,
    });
    results.summary.failed++;
  }
  results.summary.total++;

  return NextResponse.json(results, {
    status: results.summary.failed === 0 ? 200 : 500,
  });
}
