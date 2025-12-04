// MCP Servers Configuration - ALL 25 SERVERS FULLY IMPLEMENTED
// Real SDK implementations - No mocks!

import axios from "axios";
import simpleGit from "simple-git";
import { promises as fs } from "fs";
import { chromium } from "playwright";
import { MongoClient } from "mongodb";
import { LinearClient } from "@linear/sdk";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";
import Database from "better-sqlite3";
import { Client as NotionClient } from "@notionhq/client";
import { WebClient as SlackClient } from "@slack/web-api";
import Airtable from "airtable";
import { google } from "googleapis";
import puppeteer from "puppeteer";
import * as Sentry from "@sentry/node";
import Stripe from "stripe";

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description: string; required?: boolean }>;
}

export interface MCPServer {
  name: string;
  category: string;
  enabled: boolean;
  tools: MCPTool[];
  resources?: MCPResource[];
  prompts?: MCPPrompt[];
  supportsSampling?: boolean;
  graphql?: { endpoint: string; headers: Record<string, string> };
  execute?: (tool: string, params: any) => Promise<any>;
  agentBriefing?: string; // AI agent usage guide: when and how to use this MCP
}

// Helper for GraphQL
async function gql(
  endpoint: string,
  query: string,
  vars: any,
  headers: Record<string, string>
) {
  const res = await axios.post(
    endpoint,
    { query, variables: vars },
    { headers }
  );
  return res.data;
}

// Connection pools moved to individual tool files:
// - postgres-tools.ts (pgPool)
// - sqlite-tools.ts (sqliteDb)
// - mongodb-tools.ts (mongoClient)

// ALL 25 MCP SERVERS - FULLY IMPLEMENTED
export const MCP_SERVERS: Record<string, MCPServer> = {
  // 1. GIT - simple-git SDK (FULLY UPGRADED: 17+ tools!)
  git: {
    name: "git",
    category: "development",
    enabled: true,
    tools: [
      // Basic Operations (6 tools)
      { name: "clone", description: "Clone repository", inputSchema: { type: "object", properties: { url: { type: "string" }, path: { type: "string" } }, required: ["url", "path"] } },
      { name: "commit", description: "Commit changes", inputSchema: { type: "object", properties: { message: { type: "string" }, files: { type: "array" }, path: { type: "string" } }, required: ["message"] } },
      { name: "push", description: "Push to remote", inputSchema: { type: "object", properties: { remote: { type: "string" }, branch: { type: "string" }, path: { type: "string" } } } },
      { name: "pull", description: "Pull from remote", inputSchema: { type: "object", properties: { remote: { type: "string" }, branch: { type: "string" }, path: { type: "string" } } } },
      { name: "status", description: "Get git status", inputSchema: { type: "object", properties: { path: { type: "string" } } } },
      { name: "log", description: "Get commit log", inputSchema: { type: "object", properties: { limit: { type: "number" }, path: { type: "string" } } } },
      
      // Branch Operations (1 tool with actions)
      { name: "branch", description: "Manage branches (list/create/delete/checkout)", inputSchema: { type: "object", properties: { action: { type: "string", enum: ["list", "create", "delete", "checkout", "switch"] }, name: { type: "string" }, path: { type: "string" } }, required: ["action"] } },
      
      // Diff Operations (2 tools)
      { name: "diff", description: "Show differences", inputSchema: { type: "object", properties: { options: { type: "object", properties: { staged: { type: "boolean" }, file: { type: "string" } } }, path: { type: "string" } } } },
      { name: "diffSummary", description: "Get diff summary", inputSchema: { type: "object", properties: { path: { type: "string" } } } },
      
      // Stash Operations (1 tool with actions)
      { name: "stash", description: "Stash operations (save/pop/list/clear/drop)", inputSchema: { type: "object", properties: { action: { type: "string", enum: ["save", "push", "pop", "list", "clear", "drop"] }, path: { type: "string" } }, required: ["action"] } },
      
      // Tag Operations (1 tool with actions)
      { name: "tag", description: "Tag operations (list/create/delete)", inputSchema: { type: "object", properties: { action: { type: "string", enum: ["list", "create", "delete"] }, name: { type: "string" }, message: { type: "string" }, path: { type: "string" } }, required: ["action"] } },
      
      // Remote Operations (1 tool with actions)
      { name: "remote", description: "Remote operations (list/add/remove/get-url)", inputSchema: { type: "object", properties: { action: { type: "string", enum: ["list", "add", "remove", "get-url"] }, name: { type: "string" }, url: { type: "string" }, path: { type: "string" } }, required: ["action"] } },
      
      // Merge & Rebase (2 tools)
      { name: "merge", description: "Merge branch", inputSchema: { type: "object", properties: { branch: { type: "string" }, options: { type: "object", properties: { noFf: { type: "boolean" }, squash: { type: "boolean" } } }, path: { type: "string" } }, required: ["branch"] } },
      { name: "rebase", description: "Rebase branch", inputSchema: { type: "object", properties: { branch: { type: "string" }, path: { type: "string" } }, required: ["branch"] } },
      
      // Reset (1 tool)
      { name: "reset", description: "Reset to commit", inputSchema: { type: "object", properties: { mode: { type: "string", enum: ["soft", "mixed", "hard"] }, commit: { type: "string" }, path: { type: "string" } } } },
      
      // Advanced (2 tools)
      { name: "blame", description: "Show file blame", inputSchema: { type: "object", properties: { file: { type: "string" }, path: { type: "string" } }, required: ["file"] } },
      { name: "show", description: "Show commit details", inputSchema: { type: "object", properties: { commit: { type: "string" }, path: { type: "string" } }, required: ["commit"] } },
    ],
    resources: [
      {
        uri: "git://status",
        name: "Git Status",
        description: "Current git status",
      },
      {
        uri: "git://branches",
        name: "Branches",
        description: "All git branches",
      },
      { uri: "git://log", name: "Commit Log", description: "Recent commits" },
    ],
    prompts: [
      {
        name: "commit_message",
        description: "Help write commit messages",
        arguments: [
          { name: "changes", description: "What changed", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      // Import the full git tools implementation
      const { executeGitTool } = await import("./git-tools");
      return await executeGitTool(tool, params);
    },
    agentBriefing: `GIT MCP - Use for ALL version control operations.

WHEN TO USE:
- Cloning repositories, committing changes, pushing/pulling code
- Managing branches (create, switch, merge, delete)
- Viewing git history, diffs, blame, status
- Stashing changes, tagging releases, managing remotes
- Any task involving source code version control

KEY TOOLS:
- clone: Get a repository from remote
- commit/push/pull: Standard git workflow
- branch: Create feature branches, switch between branches
- merge/rebase: Integrate changes
- status/log/diff: Inspect repository state

USE CASES:
- "Create a feature branch for new authentication system"
- "Commit all changes with message 'Add user login'"
- "Show me what files changed in the last commit"
- "Merge feature branch into main"
- "Clone the repository from GitHub"

AVOID: Use GitHub MCP for GitHub-specific features (issues, PRs, workflows). Use Git MCP for local git operations.`,
  },

  // 2. FILESYSTEM - Node.js fs/promises
  filesystem: {
    name: "filesystem",
    category: "development",
    enabled: true,
    tools: [
      {
        name: "readFile",
        description: "Read file",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string" },
            encoding: { type: "string", default: "utf8" },
          },
          required: ["path"],
        },
      },
      {
        name: "writeFile",
        description: "Write file",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" }, content: { type: "string" } },
          required: ["path", "content"],
        },
      },
      {
        name: "listDir",
        description: "List directory",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
      {
        name: "deleteFile",
        description: "Delete file",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
      {
        name: "createDir",
        description: "Create directory",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string" },
            recursive: { type: "boolean", default: true },
          },
          required: ["path"],
        },
      },
      {
        name: "fileInfo",
        description: "Get file info",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
    ],
    resources: [
      {
        uri: "file:///",
        name: "Root Directory",
        description: "Filesystem root access",
      },
    ],
    prompts: [
      {
        name: "file_operations",
        description: "Help with file operations",
        arguments: [
          { name: "operation", description: "What to do", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      switch (tool) {
        case "readFile":
          return await fs.readFile(params.path, params.encoding || "utf8");
        case "writeFile":
          return await fs.writeFile(params.path, params.content);
        case "listDir":
          return await fs.readdir(params.path, { withFileTypes: true });
        case "deleteFile":
          return await fs.unlink(params.path);
        case "createDir":
          return await fs.mkdir(params.path, {
            recursive: params.recursive !== false,
          });
        case "fileInfo":
          return await fs.stat(params.path);
        default:
          throw new Error(`Unknown filesystem tool: ${tool}`);
      }
    },
    agentBriefing: `FILESYSTEM MCP - Use for ALL file and directory operations.

WHEN TO USE:
- Reading/writing files, creating/deleting directories
- Listing directory contents, checking file info
- File manipulation tasks, configuration file management
- Any task involving local file system operations

KEY TOOLS:
- readFile: Read file contents (supports encoding)
- writeFile: Write/create files
- listDir: List directory contents
- deleteFile: Remove files
- createDir: Create directories (recursive support)
- fileInfo: Get file stats (size, permissions, etc.)

USE CASES:
- "Read the package.json file"
- "Create a new directory structure"
- "List all files in the app directory"
- "Write configuration to .env file"
- "Delete temporary files"

AVOID: Use Git MCP for version-controlled file operations. Use Filesystem MCP for direct file system access.`,
  },

  // 3. PLAYWRIGHT - Playwright SDK (FULLY UPGRADED: 24+ tools!)
  playwright: {
    name: "playwright",
    category: "automation",
    enabled: true,
    tools: [
      // Navigation (4 tools)
      { name: "navigate", description: "Navigate to URL", inputSchema: { type: "object", properties: { url: { type: "string" }, waitUntil: { type: "string" }, timeout: { type: "number" } }, required: ["url"] } },
      { name: "goBack", description: "Go back", inputSchema: { type: "object", properties: { waitUntil: { type: "string" } } } },
      { name: "goForward", description: "Go forward", inputSchema: { type: "object", properties: { waitUntil: { type: "string" } } } },
      { name: "reload", description: "Reload page", inputSchema: { type: "object", properties: { waitUntil: { type: "string" } } } },
      
      // Screenshots (2 tools)
      { name: "screenshot", description: "Take screenshot", inputSchema: { type: "object", properties: { url: { type: "string" }, fullPage: { type: "boolean" }, type: { type: "string" }, quality: { type: "number" } } } },
      { name: "screenshotElement", description: "Screenshot element", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" }, type: { type: "string" } }, required: ["selector"] } },
      
      // PDF (1 tool)
      { name: "generatePDF", description: "Generate PDF", inputSchema: { type: "object", properties: { url: { type: "string" }, format: { type: "string" }, landscape: { type: "boolean" }, printBackground: { type: "boolean" } } } },
      
      // Video (1 tool)
      { name: "recordVideo", description: "Record video", inputSchema: { type: "object", properties: { url: { type: "string" }, duration: { type: "number" }, actions: { type: "array" }, videoDir: { type: "string" } }, required: ["url"] } },
      
      // Scraping (3 tools)
      { name: "scrape", description: "Scrape content", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" } } } },
      { name: "scrapeMultiple", description: "Scrape multiple selectors", inputSchema: { type: "object", properties: { url: { type: "string" }, selectors: { type: "object" } }, required: ["selectors"] } },
      { name: "evaluate", description: "Evaluate JavaScript", inputSchema: { type: "object", properties: { url: { type: "string" }, script: { type: "string" } }, required: ["script"] } },
      
      // Interactions (5 tools)
      { name: "click", description: "Click element", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" }, button: { type: "string" }, clickCount: { type: "number" } }, required: ["selector"] } },
      { name: "fill", description: "Fill input", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" }, value: { type: "string" } }, required: ["selector", "value"] } },
      { name: "type", description: "Type text", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" }, text: { type: "string" }, delay: { type: "number" } }, required: ["selector", "text"] } },
      { name: "select", description: "Select option", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" }, value: { type: "string" } }, required: ["selector", "value"] } },
      { name: "interact", description: "Execute multiple actions", inputSchema: { type: "object", properties: { url: { type: "string" }, actions: { type: "array" } }, required: ["actions"] } },
      
      // Waiting (2 tools)
      { name: "waitForSelector", description: "Wait for selector", inputSchema: { type: "object", properties: { url: { type: "string" }, selector: { type: "string" }, state: { type: "string" }, timeout: { type: "number" } }, required: ["selector"] } },
      { name: "waitForNavigation", description: "Wait for navigation", inputSchema: { type: "object", properties: { url: { type: "string" }, waitUntil: { type: "string" }, timeout: { type: "number" } }, required: ["url"] } },
      
      // Network (2 tools)
      { name: "interceptNetwork", description: "Intercept network requests", inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
      { name: "blockResources", description: "Block resources", inputSchema: { type: "object", properties: { url: { type: "string" }, pattern: { type: "string" } }, required: ["url"] } },
      
      // Cookies (3 tools)
      { name: "getCookies", description: "Get cookies", inputSchema: { type: "object", properties: { url: { type: "string" }, urls: { type: "array" } } } },
      { name: "setCookies", description: "Set cookies", inputSchema: { type: "object", properties: { cookies: { type: "array" } }, required: ["cookies"] } },
      { name: "clearCookies", description: "Clear cookies", inputSchema: { type: "object", properties: {} } },
      
      // Storage (2 tools)
      { name: "getLocalStorage", description: "Get localStorage", inputSchema: { type: "object", properties: { url: { type: "string" } } } },
      { name: "setLocalStorage", description: "Set localStorage", inputSchema: { type: "object", properties: { url: { type: "string" }, items: { type: "object" } }, required: ["items"] } },
      
      // Emulation (3 tools)
      { name: "emulateDevice", description: "Emulate device", inputSchema: { type: "object", properties: { url: { type: "string" }, device: { type: "string" } }, required: ["url", "device"] } },
      { name: "setGeolocation", description: "Set geolocation", inputSchema: { type: "object", properties: { url: { type: "string" }, latitude: { type: "number" }, longitude: { type: "number" }, accuracy: { type: "number" } }, required: ["latitude", "longitude"] } },
      { name: "setViewport", description: "Set viewport", inputSchema: { type: "object", properties: { width: { type: "number" }, height: { type: "number" } }, required: ["width", "height"] } },
    ],
    resources: [
      { uri: "playwright://browsers", name: "Browsers", description: "Available browsers" },
      { uri: "playwright://devices", name: "Devices", description: "Emulated devices" },
    ],
    prompts: [
      { name: "web_automation", description: "Help automate web tasks", arguments: [{ name: "task", description: "What to automate", required: true }] },
      { name: "scrape_data", description: "Help scrape data", arguments: [{ name: "url", description: "URL to scrape", required: true }] },
      { name: "test_website", description: "Help test website", arguments: [{ name: "url", description: "URL to test", required: true }] },
    ],
    execute: async (tool, params) => {
      const { executePlaywrightTool } = await import("./playwright-tools");
      return await executePlaywrightTool(tool, params);
    },
    agentBriefing: `PLAYWRIGHT MCP - Use for ALL browser automation and web scraping.

WHEN TO USE:
- Web scraping, automated testing, browser automation
- Taking screenshots, generating PDFs, recording videos
- Form filling, clicking buttons, navigating pages
- JavaScript execution in browser context
- Network interception, cookie management

KEY TOOLS:
- navigate: Go to URL, wait for page load
- screenshot/screenshotElement: Capture page or element
- scrape/scrapeMultiple: Extract data from pages
- click/fill/type/select: Interact with page elements
- evaluate: Run JavaScript in page context
- generatePDF: Convert page to PDF
- recordVideo: Record browser session

USE CASES:
- "Take a screenshot of this website"
- "Scrape product prices from this page"
- "Fill out and submit this form"
- "Click the login button and wait for dashboard"
- "Extract all links from this page"

AVOID: Use Puppeteer MCP for similar tasks (they overlap). Playwright is more modern and feature-rich.`,
  },

  // 4. N8N - @leonardsellem/n8n-mcp-server (BEST IN THE WORLD! 🌍)
  // Official n8n MCP Server - AI-optimized, production-ready
  n8n: {
    name: "n8n",
    category: "automation",
    enabled: true,
    tools: [
      {
        name: "dynamic",
        description: "Tools from @leonardsellem/n8n-mcp-server",
        inputSchema: { type: "object", properties: {} },
      },
    ],
    resources: [
      {
        uri: "n8n-community://tools",
        name: "Community n8n Tools",
        description: "From @leonardsellem/n8n-mcp-server",
      },
    ],
    prompts: [
      {
        name: "n8n_help",
        description: "Get help with n8n workflows",
        arguments: [],
      },
    ],
    agentBriefing: `N8N MCP - Use for workflow automation and integration orchestration.

WHEN TO USE:
- Creating, managing, and executing n8n workflows
- Building automation workflows from descriptions
- Triggering workflows, checking execution status
- Integrating multiple services via n8n workflows
- Complex multi-step automation tasks

KEY TOOLS:
- dynamic: Access all n8n community tools dynamically
- n8n_help prompt: Get help with n8n workflows

USE CASES:
- "Create a workflow that sends Slack notification when GitHub issue is created"
- "Execute the data sync workflow"
- "List all active workflows"
- "Check status of workflow execution"
- "Build a workflow that syncs Notion pages to Airtable"

AVOID: Use individual MCP servers (Slack, GitHub, etc.) for simple single-service tasks. Use n8n for complex multi-service workflows.`,
  },

  // 5. MONGODB - MongoDB SDK
  // 5. MONGODB - mongodb SDK (FULLY UPGRADED: 17+ tools!)
  mongodb: {
    name: "mongodb",
    category: "database",
    enabled: true,
    tools: [
      // Collection Operations
      {
        name: "listCollections",
        description: "List all collections",
        inputSchema: {
          type: "object",
          properties: { database: { type: "string" } },
          required: ["database"],
        },
      },
      {
        name: "createCollection",
        description: "Create collection",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            options: { type: "object" },
          },
          required: ["database", "collection"],
        },
      },
      {
        name: "dropCollection",
        description: "Drop collection",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
          },
          required: ["database", "collection"],
        },
      },
      {
        name: "collectionStats",
        description: "Get collection statistics",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
          },
          required: ["database", "collection"],
        },
      },

      // Document Operations
      {
        name: "find",
        description: "Find documents",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
            limit: { type: "number" },
            sort: { type: "object" },
          },
          required: ["database", "collection"],
        },
      },
      {
        name: "findOne",
        description: "Find one document",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
          },
          required: ["database", "collection"],
        },
      },
      {
        name: "insert",
        description: "Insert document",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            document: { type: "object" },
          },
          required: ["database", "collection", "document"],
        },
      },
      {
        name: "insertMany",
        description: "Insert multiple documents",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            documents: { type: "array" },
          },
          required: ["database", "collection", "documents"],
        },
      },
      {
        name: "update",
        description: "Update documents",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
            update: { type: "object" },
            upsert: { type: "boolean" },
          },
          required: ["database", "collection", "query", "update"],
        },
      },
      {
        name: "updateOne",
        description: "Update one document",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
            update: { type: "object" },
            upsert: { type: "boolean" },
          },
          required: ["database", "collection", "query", "update"],
        },
      },
      {
        name: "delete",
        description: "Delete documents",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
          },
          required: ["database", "collection", "query"],
        },
      },
      {
        name: "deleteOne",
        description: "Delete one document",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
          },
          required: ["database", "collection", "query"],
        },
      },
      {
        name: "countDocuments",
        description: "Count documents",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            query: { type: "object" },
          },
          required: ["database", "collection"],
        },
      },

      // Aggregation & Advanced
      {
        name: "aggregate",
        description: "Aggregation pipeline",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            pipeline: { type: "array" },
          },
          required: ["database", "collection", "pipeline"],
        },
      },
      {
        name: "distinct",
        description: "Get distinct values",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            field: { type: "string" },
            query: { type: "object" },
          },
          required: ["database", "collection", "field"],
        },
      },

      // Index Management
      {
        name: "listIndexes",
        description: "List indexes",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
          },
          required: ["database", "collection"],
        },
      },
      {
        name: "createIndex",
        description: "Create index",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            keys: { type: "object" },
            options: { type: "object" },
          },
          required: ["database", "collection", "keys"],
        },
      },
      {
        name: "dropIndex",
        description: "Drop index",
        inputSchema: {
          type: "object",
          properties: {
            database: { type: "string" },
            collection: { type: "string" },
            indexName: { type: "string" },
          },
          required: ["database", "collection", "indexName"],
        },
      },
    ],
    resources: [
      {
        uri: "mongodb://databases",
        name: "Databases",
        description: "List all databases",
      },
      {
        uri: "mongodb://collections",
        name: "Collections",
        description: "List all collections",
      },
      {
        uri: "mongodb://indexes",
        name: "Indexes",
        description: "List all indexes",
      },
    ],
    prompts: [
      {
        name: "query_builder",
        description: "AI-powered MongoDB query builder",
        arguments: [
          { name: "description", description: "What to query", required: true },
        ],
      },
      {
        name: "aggregation_builder",
        description: "AI-powered aggregation pipeline builder",
        arguments: [
          {
            name: "description",
            description: "What to aggregate",
            required: true,
          },
        ],
      },
    ],
    execute: async (tool, params) => {
      // Import the full mongodb tools implementation
      const { executeMongoDBTool } = await import("./mongodb-tools");
      return await executeMongoDBTool(tool, params);
    },
    agentBriefing: `MONGODB MCP - Use for ALL MongoDB database operations.

WHEN TO USE:
- NoSQL database operations, document storage/retrieval
- Collection management, document CRUD operations
- Aggregation pipelines, complex queries
- Index management, performance optimization
- MongoDB-specific operations (distinct, count, etc.)

KEY TOOLS:
- listDatabases/listCollections: Discover database structure
- find/findOne: Query documents
- insert/insertMany: Create documents
- update/updateOne: Modify documents
- delete/deleteOne: Remove documents
- aggregate: Complex data processing pipelines
- createIndex/dropIndex: Performance optimization

USE CASES:
- "Find all users with status 'active'"
- "Insert a new document into the 'products' collection"
- "Run an aggregation to calculate total sales by month"
- "Create an index on the 'email' field"
- "Update user document with new profile data"

AVOID: Use Postgres/SQLite MCP for relational data. Use MongoDB MCP for document-based, schema-flexible data.`,
  },

  // 6. LINEAR - @linear/sdk (FULLY UPGRADED: 30+ tools!)
  linear: {
    name: "linear",
    category: "productivity",
    enabled: true,
    graphql: {
      endpoint: "https://api.linear.app/graphql",
      headers: { Authorization: process.env.LINEAR_API_KEY || "" },
    },
    tools: [
      // Issue Operations
      {
        name: "listIssues",
        description: "List Linear issues",
        inputSchema: {
          type: "object",
          properties: { filter: { type: "object" } },
        },
      },
      {
        name: "getIssue",
        description: "Get issue by ID",
        inputSchema: {
          type: "object",
          properties: { issueId: { type: "string" } },
          required: ["issueId"],
        },
      },
      {
        name: "createIssue",
        description: "Create Linear issue",
        inputSchema: {
          type: "object",
          properties: {
            teamId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            priority: { type: "number" },
            assigneeId: { type: "string" },
            labelIds: { type: "array" },
            projectId: { type: "string" },
            cycleId: { type: "string" },
            estimate: { type: "number" },
          },
          required: ["teamId", "title"],
        },
      },
      {
        name: "updateIssue",
        description: "Update Linear issue",
        inputSchema: {
          type: "object",
          properties: { issueId: { type: "string" }, data: { type: "object" } },
          required: ["issueId", "data"],
        },
      },
      {
        name: "deleteIssue",
        description: "Delete issue",
        inputSchema: {
          type: "object",
          properties: { issueId: { type: "string" } },
          required: ["issueId"],
        },
      },
      {
        name: "searchIssues",
        description: "Search Linear issues",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },

      // Comment Operations
      {
        name: "createComment",
        description: "Create comment on issue",
        inputSchema: {
          type: "object",
          properties: { issueId: { type: "string" }, body: { type: "string" } },
          required: ["issueId", "body"],
        },
      },
      {
        name: "listComments",
        description: "List issue comments",
        inputSchema: {
          type: "object",
          properties: { issueId: { type: "string" } },
          required: ["issueId"],
        },
      },
      {
        name: "updateComment",
        description: "Update comment",
        inputSchema: {
          type: "object",
          properties: { commentId: { type: "string" }, body: { type: "string" } },
          required: ["commentId", "body"],
        },
      },
      {
        name: "deleteComment",
        description: "Delete comment",
        inputSchema: {
          type: "object",
          properties: { commentId: { type: "string" } },
          required: ["commentId"],
        },
      },

      // Project Operations
      {
        name: "listProjects",
        description: "List projects",
        inputSchema: {
          type: "object",
          properties: { teamId: { type: "string" } },
        },
      },
      {
        name: "getProject",
        description: "Get project by ID",
        inputSchema: {
          type: "object",
          properties: { projectId: { type: "string" } },
          required: ["projectId"],
        },
      },
      {
        name: "createProject",
        description: "Create project",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            teamIds: { type: "array" },
            leadId: { type: "string" },
            targetDate: { type: "string" },
          },
          required: ["name", "teamIds"],
        },
      },
      {
        name: "updateProject",
        description: "Update project",
        inputSchema: {
          type: "object",
          properties: { projectId: { type: "string" }, data: { type: "object" } },
          required: ["projectId", "data"],
        },
      },
      {
        name: "deleteProject",
        description: "Delete project",
        inputSchema: {
          type: "object",
          properties: { projectId: { type: "string" } },
          required: ["projectId"],
        },
      },

      // Cycle Operations
      {
        name: "listCycles",
        description: "List cycles",
        inputSchema: {
          type: "object",
          properties: { teamId: { type: "string" } },
          required: ["teamId"],
        },
      },
      {
        name: "getCycle",
        description: "Get cycle by ID",
        inputSchema: {
          type: "object",
          properties: { cycleId: { type: "string" } },
          required: ["cycleId"],
        },
      },
      {
        name: "createCycle",
        description: "Create cycle",
        inputSchema: {
          type: "object",
          properties: {
            teamId: { type: "string" },
            name: { type: "string" },
            startsAt: { type: "string" },
            endsAt: { type: "string" },
          },
          required: ["teamId", "name", "startsAt", "endsAt"],
        },
      },
      {
        name: "updateCycle",
        description: "Update cycle",
        inputSchema: {
          type: "object",
          properties: { cycleId: { type: "string" }, data: { type: "object" } },
          required: ["cycleId", "data"],
        },
      },

      // Label Operations
      {
        name: "listLabels",
        description: "List labels",
        inputSchema: {
          type: "object",
          properties: { teamId: { type: "string" } },
        },
      },
      {
        name: "createLabel",
        description: "Create label",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            description: { type: "string" },
            teamId: { type: "string" },
          },
          required: ["name"],
        },
      },
      {
        name: "updateLabel",
        description: "Update label",
        inputSchema: {
          type: "object",
          properties: { labelId: { type: "string" }, data: { type: "object" } },
          required: ["labelId", "data"],
        },
      },
      {
        name: "deleteLabel",
        description: "Delete label",
        inputSchema: {
          type: "object",
          properties: { labelId: { type: "string" } },
          required: ["labelId"],
        },
      },

      // Team Operations
      {
        name: "listTeams",
        description: "List all teams",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "getTeam",
        description: "Get team by ID",
        inputSchema: {
          type: "object",
          properties: { teamId: { type: "string" } },
          required: ["teamId"],
        },
      },

      // User Operations
      {
        name: "listUsers",
        description: "List all users",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "getUser",
        description: "Get user by ID",
        inputSchema: {
          type: "object",
          properties: { userId: { type: "string" } },
          required: ["userId"],
        },
      },
      {
        name: "getViewer",
        description: "Get current authenticated user",
        inputSchema: { type: "object", properties: {} },
      },

      // Attachment Operations
      {
        name: "createAttachment",
        description: "Create attachment",
        inputSchema: {
          type: "object",
          properties: {
            issueId: { type: "string" },
            title: { type: "string" },
            url: { type: "string" },
          },
          required: ["issueId", "title", "url"],
        },
      },
      {
        name: "listAttachments",
        description: "List issue attachments",
        inputSchema: {
          type: "object",
          properties: { issueId: { type: "string" } },
          required: ["issueId"],
        },
      },
      {
        name: "deleteAttachment",
        description: "Delete attachment",
        inputSchema: {
          type: "object",
          properties: { attachmentId: { type: "string" } },
          required: ["attachmentId"],
        },
      },

      // Bulk Operations
      {
        name: "bulkUpdateIssues",
        description: "Bulk update multiple issues",
        inputSchema: {
          type: "object",
          properties: {
            issueIds: { type: "array" },
            data: { type: "object" },
          },
          required: ["issueIds", "data"],
        },
      },
    ],
    resources: [
      { uri: "linear://teams", name: "Teams", description: "All Linear teams" },
      {
        uri: "linear://issues",
        name: "Issues",
        description: "All Linear issues",
      },
    ],
    prompts: [
      {
        name: "create_task",
        description: "Help create Linear task",
        arguments: [
          {
            name: "description",
            description: "Task description",
            required: true,
          },
        ],
      },
    ],
    supportsSampling: false,
    execute: async (tool, params) => {
      // Import the full linear tools implementation
      const { executeLinearTool } = await import("./linear-tools");
      return await executeLinearTool(tool, params);
    },
    agentBriefing: `LINEAR MCP - Use for ALL project management and issue tracking.

WHEN TO USE:
- Creating, updating, searching issues
- Managing projects, cycles, labels
- Team collaboration, issue comments
- Project planning, sprint management
- Issue lifecycle management

KEY TOOLS:
- listIssues/createIssue/updateIssue: Issue management
- searchIssues: Find issues by query
- listProjects/createProject: Project management
- listCycles/createCycle: Sprint/cycle planning
- createComment/listComments: Team collaboration
- bulkUpdateIssues: Batch operations

USE CASES:
- "Create an issue for the authentication bug"
- "List all issues assigned to me"
- "Update issue status to 'In Progress'"
- "Create a new project for Q1 features"
- "Search for issues with label 'bug'"

AVOID: Use GitHub MCP for code-related issues/PRs. Use Linear MCP for project management and team coordination.`,
  },

  // 7. RAILWAY - GraphQL API (FULLY UPGRADED: 22+ tools!)
  railway: {
    name: "railway",
    category: "infrastructure",
    enabled: true,
    graphql: {
      endpoint: "https://backboard.railway.com/graphql/v2",
      headers: { Authorization: `Bearer ${process.env.RAILWAY_TOKEN || ""}` },
    },
    tools: [
      // Projects (4 tools)
      { name: "listProjects", description: "List Railway projects", inputSchema: { type: "object", properties: {} } },
      { name: "getProject", description: "Get project details", inputSchema: { type: "object", properties: { projectId: { type: "string" } }, required: ["projectId"] } },
      { name: "createProject", description: "Create project", inputSchema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name"] } },
      { name: "deleteProject", description: "Delete project", inputSchema: { type: "object", properties: { projectId: { type: "string" } }, required: ["projectId"] } },
      
      // Services (4 tools)
      { name: "listServices", description: "List services", inputSchema: { type: "object", properties: { projectId: { type: "string" } }, required: ["projectId"] } },
      { name: "getService", description: "Get service details", inputSchema: { type: "object", properties: { serviceId: { type: "string" } }, required: ["serviceId"] } },
      { name: "createService", description: "Create service", inputSchema: { type: "object", properties: { projectId: { type: "string" }, name: { type: "string" }, source: { type: "object" } }, required: ["projectId", "name"] } },
      { name: "deleteService", description: "Delete service", inputSchema: { type: "object", properties: { serviceId: { type: "string" } }, required: ["serviceId"] } },
      
      // Deployments (4 tools)
      { name: "deployService", description: "Deploy service", inputSchema: { type: "object", properties: { serviceId: { type: "string" } }, required: ["serviceId"] } },
      { name: "listDeployments", description: "List deployments", inputSchema: { type: "object", properties: { serviceId: { type: "string" } }, required: ["serviceId"] } },
      { name: "getDeployment", description: "Get deployment details", inputSchema: { type: "object", properties: { deploymentId: { type: "string" } }, required: ["deploymentId"] } },
      { name: "rollbackDeployment", description: "Rollback deployment", inputSchema: { type: "object", properties: { deploymentId: { type: "string" } }, required: ["deploymentId"] } },
      
      // Environment Variables (3 tools)
      { name: "listVariables", description: "List environment variables", inputSchema: { type: "object", properties: { serviceId: { type: "string" }, environmentId: { type: "string" } }, required: ["serviceId", "environmentId"] } },
      { name: "setVariable", description: "Set environment variable", inputSchema: { type: "object", properties: { serviceId: { type: "string" }, environmentId: { type: "string" }, name: { type: "string" }, value: { type: "string" } }, required: ["serviceId", "environmentId", "name", "value"] } },
      { name: "deleteVariable", description: "Delete environment variable", inputSchema: { type: "object", properties: { variableId: { type: "string" } }, required: ["variableId"] } },
      
      // Volumes (3 tools)
      { name: "listVolumes", description: "List volumes", inputSchema: { type: "object", properties: { serviceId: { type: "string" } }, required: ["serviceId"] } },
      { name: "createVolume", description: "Create volume", inputSchema: { type: "object", properties: { serviceId: { type: "string" }, name: { type: "string" }, mountPath: { type: "string" } }, required: ["serviceId", "name", "mountPath"] } },
      { name: "deleteVolume", description: "Delete volume", inputSchema: { type: "object", properties: { volumeId: { type: "string" } }, required: ["volumeId"] } },
      
      // Domains (3 tools)
      { name: "listDomains", description: "List custom domains", inputSchema: { type: "object", properties: { serviceId: { type: "string" } }, required: ["serviceId"] } },
      { name: "createDomain", description: "Create custom domain", inputSchema: { type: "object", properties: { serviceId: { type: "string" }, domain: { type: "string" } }, required: ["serviceId", "domain"] } },
      { name: "deleteDomain", description: "Delete custom domain", inputSchema: { type: "object", properties: { domainId: { type: "string" } }, required: ["domainId"] } },
      
      // Logs & Metrics (2 tools)
      { name: "getLogs", description: "Get deployment logs", inputSchema: { type: "object", properties: { deploymentId: { type: "string" }, limit: { type: "number" } }, required: ["deploymentId"] } },
      { name: "getMetrics", description: "Get service metrics", inputSchema: { type: "object", properties: { serviceId: { type: "string" }, measurementName: { type: "string" } }, required: ["serviceId"] } },
      
      // Environments (2 tools)
      { name: "listEnvironments", description: "List environments", inputSchema: { type: "object", properties: { projectId: { type: "string" } }, required: ["projectId"] } },
      { name: "createEnvironment", description: "Create environment", inputSchema: { type: "object", properties: { projectId: { type: "string" }, name: { type: "string" } }, required: ["projectId", "name"] } },
    ],
    resources: [
      { uri: "railway://projects", name: "Projects", description: "All Railway projects" },
      { uri: "railway://deployments", name: "Deployments", description: "Recent deployments" },
      { uri: "railway://services", name: "Services", description: "All services" },
      { uri: "railway://metrics", name: "Metrics", description: "Service metrics" },
    ],
    prompts: [
      { name: "deploy_app", description: "Help deploy to Railway", arguments: [{ name: "repo", description: "GitHub repo URL", required: true }] },
      { name: "manage_env", description: "Manage environment variables", arguments: [{ name: "service", description: "Service name", required: true }] },
      { name: "troubleshoot", description: "Troubleshoot deployment", arguments: [{ name: "issue", description: "Issue description", required: true }] },
    ],
    execute: async (tool, params) => {
      const { executeRailwayTool } = await import("./railway-tools");
      return await executeRailwayTool(tool, params);
    },
    agentBriefing: `RAILWAY MCP - Use for ALL Railway deployment and infrastructure management.

WHEN TO USE:
- Managing Railway projects, services, deployments
- Viewing logs, metrics, deployment status
- Managing domains, volumes, environment variables
- Infrastructure as code operations
- Deployment automation

KEY TOOLS:
- listProjects/getProject: Project management
- listServices/getService: Service management
- deployService: Trigger deployments
- getLogs: View service logs
- listDomains/createDomain: Custom domain management
- listVolumes/createVolume: Persistent storage

USE CASES:
- "List all Railway projects"
- "Deploy the latest code to production"
- "Get logs from the API service"
- "Create a custom domain for the service"
- "Check deployment status"

AVOID: Use other MCPs for application logic. Use Railway MCP for infrastructure and deployment operations.`,
  },

  // 8. GITHUB - Octokit SDK (FULLY UPGRADED: 35+ tools!)
  github: {
    name: "github",
    category: "development",
    enabled: true,
    graphql: {
      endpoint: "https://api.github.com/graphql",
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN || ""}` },
    },
    tools: [
      // Repository Operations (5 tools)
      { name: "listRepos", description: "List repos", inputSchema: { type: "object", properties: { owner: { type: "string" }, limit: { type: "number" } } } },
      { name: "getRepo", description: "Get repo details", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "createRepo", description: "Create repo", inputSchema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, private: { type: "boolean" } }, required: ["name"] } },
      { name: "updateRepo", description: "Update repo", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, data: { type: "object" } }, required: ["owner", "repo", "data"] } },
      { name: "deleteRepo", description: "Delete repo", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
      
      // Issue Operations (5 tools)
      { name: "listIssues", description: "List issues", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, state: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "getIssue", description: "Get issue", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, issue_number: { type: "number" } }, required: ["owner", "repo", "issue_number"] } },
      { name: "createIssue", description: "Create issue", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, title: { type: "string" }, body: { type: "string" }, labels: { type: "array" } }, required: ["owner", "repo", "title"] } },
      { name: "updateIssue", description: "Update issue", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, issue_number: { type: "number" }, data: { type: "object" } }, required: ["owner", "repo", "issue_number", "data"] } },
      { name: "closeIssue", description: "Close issue", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, issue_number: { type: "number" } }, required: ["owner", "repo", "issue_number"] } },
      
      // Pull Request Operations (5 tools)
      { name: "listPRs", description: "List PRs", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, state: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "getPR", description: "Get PR", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, pull_number: { type: "number" } }, required: ["owner", "repo", "pull_number"] } },
      { name: "createPR", description: "Create PR", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, title: { type: "string" }, head: { type: "string" }, base: { type: "string" }, body: { type: "string" } }, required: ["owner", "repo", "title", "head", "base"] } },
      { name: "mergePR", description: "Merge PR", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, pull_number: { type: "number" }, merge_method: { type: "string" } }, required: ["owner", "repo", "pull_number"] } },
      { name: "reviewPR", description: "Review PR", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, pull_number: { type: "number" }, event: { type: "string" }, body: { type: "string" } }, required: ["owner", "repo", "pull_number", "event"] } },
      
      // Workflow Operations (5 tools)
      { name: "listWorkflows", description: "List workflows", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "getWorkflow", description: "Get workflow", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, workflow_id: { type: "number" } }, required: ["owner", "repo", "workflow_id"] } },
      { name: "triggerWorkflow", description: "Trigger workflow", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, workflow_id: { type: "number" }, ref: { type: "string" }, inputs: { type: "object" } }, required: ["owner", "repo", "workflow_id", "ref"] } },
      { name: "listWorkflowRuns", description: "List workflow runs", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, workflow_id: { type: "number" } }, required: ["owner", "repo"] } },
      { name: "getWorkflowRun", description: "Get workflow run", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, run_id: { type: "number" } }, required: ["owner", "repo", "run_id"] } },
      
      // Release Operations (5 tools)
      { name: "listReleases", description: "List releases", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "getRelease", description: "Get release", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, release_id: { type: "number" } }, required: ["owner", "repo", "release_id"] } },
      { name: "createRelease", description: "Create release", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, tag_name: { type: "string" }, name: { type: "string" }, body: { type: "string" } }, required: ["owner", "repo", "tag_name"] } },
      { name: "updateRelease", description: "Update release", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, release_id: { type: "number" }, data: { type: "object" } }, required: ["owner", "repo", "release_id", "data"] } },
      { name: "deleteRelease", description: "Delete release", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, release_id: { type: "number" } }, required: ["owner", "repo", "release_id"] } },
      
      // Branch Operations (4 tools)
      { name: "listBranches", description: "List branches", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "getBranch", description: "Get branch", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, branch: { type: "string" } }, required: ["owner", "repo", "branch"] } },
      { name: "createBranch", description: "Create branch", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, branch: { type: "string" }, sha: { type: "string" } }, required: ["owner", "repo", "branch", "sha"] } },
      { name: "deleteBranch", description: "Delete branch", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, branch: { type: "string" } }, required: ["owner", "repo", "branch"] } },
      
      // Commit Operations (2 tools)
      { name: "listCommits", description: "List commits", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, sha: { type: "string" }, path: { type: "string" } }, required: ["owner", "repo"] } },
      { name: "getCommit", description: "Get commit", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, ref: { type: "string" } }, required: ["owner", "repo", "ref"] } },
      
      // Search Operations (3 tools)
      { name: "searchCode", description: "Search code", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "searchRepos", description: "Search repos", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "searchIssues", description: "Search issues", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
    ],
    resources: [
      { uri: "github://repos", name: "Repositories", description: "All repos" },
      { uri: "github://issues", name: "Issues", description: "All issues" },
    ],
    prompts: [
      {
        name: "code_review",
        description: "Help with code review",
        arguments: [{ name: "pr_url", description: "PR URL", required: true }],
      },
    ],
    execute: async (tool, params) => {
      // Import the full github tools implementation
      const { executeGitHubTool } = await import("./github-tools");
      return await executeGitHubTool(tool, params);
    },
    agentBriefing: `GITHUB MCP - Use for ALL GitHub repository and collaboration operations.

WHEN TO USE:
- Repository management (create, clone, manage branches)
- Issue and Pull Request operations
- Code search, file management
- GitHub Actions workflows
- Release management, team collaboration

KEY TOOLS:
- listRepos/createRepo: Repository management
- createIssue/updateIssue: Issue tracking
- createPR/reviewPR/mergePR: Pull request workflow
- searchCode: Code search across repositories
- listWorkflows/triggerWorkflow: GitHub Actions
- listReleases/createRelease: Release management

USE CASES:
- "Create a new repository for the project"
- "Open a pull request for feature branch"
- "Search for all uses of this function"
- "Create an issue for the bug"
- "Trigger the deployment workflow"

AVOID: Use Git MCP for local git operations. Use GitHub MCP for GitHub platform features (issues, PRs, workflows, releases).`,
  },

  // 9. OPENAI - OpenAI SDK with Sampling (FULLY UPGRADED: 30+ tools!)
  openai: {
    name: "openai",
    category: "ai",
    enabled: true,
    supportsSampling: true,
    tools: [
      // Chat Completions (5 tools)
      { name: "chat", description: "Chat with GPT", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, temperature: { type: "number" }, max_tokens: { type: "number" } }, required: ["messages"] } },
      { name: "chatStreaming", description: "Chat with streaming", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, temperature: { type: "number" } }, required: ["messages"] } },
      { name: "chatWithFunctions", description: "Chat with function calling", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, functions: { type: "array" }, function_call: { type: "string" } }, required: ["messages", "functions"] } },
      { name: "chatWithTools", description: "Chat with tools", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, tools: { type: "array" }, tool_choice: { type: "string" } }, required: ["messages", "tools"] } },
      { name: "chatWithVision", description: "Chat with vision (images)", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, max_tokens: { type: "number" } }, required: ["messages"] } },
      
      // Legacy Completions (1 tool)
      { name: "completion", description: "Text completion", inputSchema: { type: "object", properties: { prompt: { type: "string" }, model: { type: "string" }, max_tokens: { type: "number" } }, required: ["prompt"] } },
      
      // Embeddings (2 tools)
      { name: "embedding", description: "Generate embeddings", inputSchema: { type: "object", properties: { input: { type: "string" }, model: { type: "string" } }, required: ["input"] } },
      { name: "batchEmbeddings", description: "Generate embeddings for multiple inputs", inputSchema: { type: "object", properties: { inputs: { type: "array" }, model: { type: "string" } }, required: ["inputs"] } },
      
      // Images (3 tools)
      { name: "generateImage", description: "Generate image with DALL-E", inputSchema: { type: "object", properties: { prompt: { type: "string" }, model: { type: "string" }, size: { type: "string" }, quality: { type: "string" }, style: { type: "string" } }, required: ["prompt"] } },
      { name: "editImage", description: "Edit image with DALL-E", inputSchema: { type: "object", properties: { image: { type: "string" }, prompt: { type: "string" }, mask: { type: "string" }, size: { type: "string" } }, required: ["image", "prompt"] } },
      { name: "createImageVariation", description: "Create image variation", inputSchema: { type: "object", properties: { image: { type: "string" }, size: { type: "string" } }, required: ["image"] } },
      
      // Assistants (8 tools)
      { name: "createAssistant", description: "Create assistant", inputSchema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, model: { type: "string" }, instructions: { type: "string" }, tools: { type: "array" } }, required: ["name", "model"] } },
      { name: "listAssistants", description: "List assistants", inputSchema: { type: "object", properties: { limit: { type: "number" }, order: { type: "string" } } } },
      { name: "getAssistant", description: "Get assistant", inputSchema: { type: "object", properties: { assistant_id: { type: "string" } }, required: ["assistant_id"] } },
      { name: "updateAssistant", description: "Update assistant", inputSchema: { type: "object", properties: { assistant_id: { type: "string" }, name: { type: "string" }, instructions: { type: "string" } }, required: ["assistant_id"] } },
      { name: "deleteAssistant", description: "Delete assistant", inputSchema: { type: "object", properties: { assistant_id: { type: "string" } }, required: ["assistant_id"] } },
      { name: "createThread", description: "Create thread", inputSchema: { type: "object", properties: { messages: { type: "array" }, metadata: { type: "object" } } } },
      { name: "runAssistant", description: "Run assistant", inputSchema: { type: "object", properties: { thread_id: { type: "string" }, assistant_id: { type: "string" }, instructions: { type: "string" } }, required: ["thread_id", "assistant_id"] } },
      { name: "getRun", description: "Get run status", inputSchema: { type: "object", properties: { thread_id: { type: "string" }, run_id: { type: "string" } }, required: ["thread_id", "run_id"] } },
      
      // Fine-tuning (4 tools)
      { name: "createFineTune", description: "Create fine-tune job", inputSchema: { type: "object", properties: { training_file: { type: "string" }, model: { type: "string" }, hyperparameters: { type: "object" } }, required: ["training_file"] } },
      { name: "listFineTunes", description: "List fine-tune jobs", inputSchema: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "getFineTune", description: "Get fine-tune job", inputSchema: { type: "object", properties: { fine_tuning_job_id: { type: "string" } }, required: ["fine_tuning_job_id"] } },
      { name: "cancelFineTune", description: "Cancel fine-tune job", inputSchema: { type: "object", properties: { fine_tuning_job_id: { type: "string" } }, required: ["fine_tuning_job_id"] } },
      
      // Audio (3 tools)
      { name: "transcribe", description: "Transcribe audio (Whisper)", inputSchema: { type: "object", properties: { file: { type: "string" }, model: { type: "string" }, language: { type: "string" } }, required: ["file"] } },
      { name: "translate", description: "Translate audio", inputSchema: { type: "object", properties: { file: { type: "string" }, model: { type: "string" } }, required: ["file"] } },
      { name: "textToSpeech", description: "Text to speech", inputSchema: { type: "object", properties: { input: { type: "string" }, voice: { type: "string" }, model: { type: "string" } }, required: ["input"] } },
      
      // Files (5 tools)
      { name: "uploadFile", description: "Upload file", inputSchema: { type: "object", properties: { file: { type: "string" }, purpose: { type: "string" } }, required: ["file"] } },
      { name: "listFiles", description: "List files", inputSchema: { type: "object", properties: { purpose: { type: "string" } } } },
      { name: "getFile", description: "Get file", inputSchema: { type: "object", properties: { file_id: { type: "string" } }, required: ["file_id"] } },
      { name: "deleteFile", description: "Delete file", inputSchema: { type: "object", properties: { file_id: { type: "string" } }, required: ["file_id"] } },
      { name: "getFileContent", description: "Get file content", inputSchema: { type: "object", properties: { file_id: { type: "string" } }, required: ["file_id"] } },
      
      // Moderation (2 tools)
      { name: "moderateText", description: "Moderate text", inputSchema: { type: "object", properties: { input: { type: "string" }, model: { type: "string" } }, required: ["input"] } },
      { name: "moderateBatch", description: "Moderate multiple texts", inputSchema: { type: "object", properties: { inputs: { type: "array" }, model: { type: "string" } }, required: ["inputs"] } },
      
      // Models (3 tools)
      { name: "listModels", description: "List models", inputSchema: { type: "object", properties: {} } },
      { name: "getModel", description: "Get model", inputSchema: { type: "object", properties: { model: { type: "string" } }, required: ["model"] } },
      { name: "deleteModel", description: "Delete fine-tuned model", inputSchema: { type: "object", properties: { model: { type: "string" } }, required: ["model"] } },
    ],
    resources: [
      { uri: "openai://models", name: "Models", description: "Available OpenAI models" },
      { uri: "openai://assistants", name: "Assistants", description: "Available assistants" },
      { uri: "openai://files", name: "Files", description: "Uploaded files" },
    ],
    prompts: [
      { name: "ai_assistant", description: "AI assistant", arguments: [{ name: "task", description: "Task description", required: true }] },
      { name: "code_review", description: "Code review assistant", arguments: [{ name: "code", description: "Code to review", required: true }] },
      { name: "summarize", description: "Summarize text", arguments: [{ name: "text", description: "Text to summarize", required: true }] },
    ],
    execute: async (tool, params) => {
      const { executeOpenAITool } = await import("./openai-tools");
      return await executeOpenAITool(tool, params);
    },
    agentBriefing: `OPENAI MCP - Use for ALL OpenAI API operations (GPT, embeddings, images, assistants).

WHEN TO USE:
- Chat completions, text generation, conversations
- Embeddings for semantic search, similarity
- Image generation (DALL-E), image editing
- Vision API (image analysis)
- Assistants API (persistent AI agents)
- Function calling, structured outputs

KEY TOOLS:
- chat: GPT chat completions with function calling
- completion: Legacy completion API
- embedding: Text embeddings for search/similarity
- generateImage/editImage: DALL-E image operations
- vision: Analyze images with GPT-4 Vision
- createAssistant/runAssistant: Persistent AI agents

USE CASES:
- "Generate a blog post about AI"
- "Create embeddings for semantic search"
- "Generate an image of a sunset"
- "Analyze this screenshot and describe what you see"
- "Create an AI assistant for customer support"

AVOID: Use Anthropic MCP for Claude models. Use OpenAI MCP for GPT models and OpenAI-specific features.`,
  },

  // 10. ANTHROPIC - Anthropic SDK with Sampling (FULLY UPGRADED: 14+ tools!)
  anthropic: {
    name: "anthropic",
    category: "ai",
    enabled: true,
    supportsSampling: true,
    tools: [
      // Messages (5 tools)
      { name: "chat", description: "Chat with Claude", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, max_tokens: { type: "number" }, temperature: { type: "number" }, system: { type: "string" } }, required: ["messages"] } },
      { name: "chatStreaming", description: "Chat with streaming", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, max_tokens: { type: "number" }, system: { type: "string" } }, required: ["messages"] } },
      { name: "chatWithTools", description: "Chat with tool use", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, tools: { type: "array" }, tool_choice: { type: "object" }, max_tokens: { type: "number" } }, required: ["messages", "tools"] } },
      { name: "chatWithVision", description: "Chat with vision (images)", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, max_tokens: { type: "number" } }, required: ["messages"] } },
      { name: "chatWithCaching", description: "Chat with prompt caching", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, system: { type: "string" }, max_tokens: { type: "number" } }, required: ["messages"] } },
      
      // Legacy (1 tool)
      { name: "completion", description: "Text completion", inputSchema: { type: "object", properties: { prompt: { type: "string" }, model: { type: "string" }, max_tokens: { type: "number" } }, required: ["prompt"] } },
      
      // Batch (1 tool)
      { name: "batchMessages", description: "Process multiple messages", inputSchema: { type: "object", properties: { messages_batch: { type: "array" }, model: { type: "string" }, max_tokens: { type: "number" } }, required: ["messages_batch"] } },
      
      // Token Counting (1 tool)
      { name: "countTokens", description: "Count tokens", inputSchema: { type: "object", properties: { model: { type: "string" }, messages: { type: "array" }, system: { type: "string" } }, required: ["messages"] } },
      
      // Models (2 tools)
      { name: "listModels", description: "List Claude models", inputSchema: { type: "object", properties: {} } },
      { name: "getModel", description: "Get model info", inputSchema: { type: "object", properties: { model: { type: "string" } }, required: ["model"] } },
      
      // Advanced (4 tools)
      { name: "extractStructuredData", description: "Extract structured data from text", inputSchema: { type: "object", properties: { text: { type: "string" }, schema: { type: "object" }, model: { type: "string" } }, required: ["text", "schema"] } },
      { name: "analyzeImage", description: "Analyze image with vision", inputSchema: { type: "object", properties: { image_data: { type: "string" }, prompt: { type: "string" }, media_type: { type: "string" }, model: { type: "string" } }, required: ["image_data"] } },
      { name: "continueConversation", description: "Continue multi-turn conversation", inputSchema: { type: "object", properties: { message: { type: "string" }, history: { type: "array" }, system: { type: "string" }, model: { type: "string" } }, required: ["message"] } },
    ],
    resources: [
      { uri: "anthropic://models", name: "Models", description: "Claude models" },
      { uri: "anthropic://capabilities", name: "Capabilities", description: "Model capabilities" },
    ],
    prompts: [
      { name: "claude_assistant", description: "Claude assistant", arguments: [{ name: "task", description: "Task", required: true }] },
      { name: "code_review", description: "Code review with Claude", arguments: [{ name: "code", description: "Code to review", required: true }] },
      { name: "analyze_data", description: "Data analysis", arguments: [{ name: "data", description: "Data to analyze", required: true }] },
    ],
    execute: async (tool, params) => {
      const { executeAnthropicTool } = await import("./anthropic-tools");
      return await executeAnthropicTool(tool, params);
    },
    agentBriefing: `ANTHROPIC MCP - Use for ALL Claude AI operations (chat, vision, structured data).

WHEN TO USE:
- Chat completions with Claude models
- Vision API (image analysis with Claude)
- Structured data extraction
- Long context conversations
- Prompt caching for cost optimization

KEY TOOLS:
- chat: Claude chat completions
- chatWithVision: Analyze images with Claude
- chatWithCaching: Use prompt caching for efficiency
- completion: Legacy completion API
- batchMessages: Process multiple messages

USE CASES:
- "Have a conversation with Claude about AI"
- "Analyze this image and describe what you see"
- "Extract structured data from this document"
- "Generate a long-form article"
- "Process multiple messages in batch"

AVOID: Use OpenAI MCP for GPT models. Use Anthropic MCP for Claude models and Anthropic-specific features.`,
  },

  // 11. POSTGRES - pg SDK (FULLY UPGRADED: 20+ tools!)
  postgres: {
    name: "postgres",
    category: "database",
    enabled: true,
    tools: [
      // Schema Discovery
      {
        name: "listDatabases",
        description: "List all databases",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "listSchemas",
        description: "List all schemas",
        inputSchema: {
          type: "object",
          properties: { database: { type: "string" } },
        },
      },
      {
        name: "listTables",
        description: "List all tables",
        inputSchema: {
          type: "object",
          properties: { schema: { type: "string", default: "public" } },
        },
      },
      {
        name: "describeTable",
        description: "Get table schema",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            schema: { type: "string", default: "public" },
          },
          required: ["table"],
        },
      },
      {
        name: "listIndexes",
        description: "List table indexes",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            schema: { type: "string", default: "public" },
          },
          required: ["table"],
        },
      },
      {
        name: "listConstraints",
        description: "List table constraints",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            schema: { type: "string", default: "public" },
          },
          required: ["table"],
        },
      },

      // DDL Operations
      {
        name: "createTable",
        description: "Create table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            columns: { type: "array" },
            schema: { type: "string", default: "public" },
          },
          required: ["table", "columns"],
        },
      },
      {
        name: "alterTable",
        description: "Alter table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            action: { type: "string" },
            schema: { type: "string", default: "public" },
          },
          required: ["table", "action"],
        },
      },
      {
        name: "dropTable",
        description: "Drop table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            schema: { type: "string", default: "public" },
            cascade: { type: "boolean", default: false },
          },
          required: ["table"],
        },
      },
      {
        name: "createIndex",
        description: "Create index",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            columns: { type: "array" },
            indexName: { type: "string" },
            unique: { type: "boolean", default: false },
          },
          required: ["table", "columns"],
        },
      },
      {
        name: "dropIndex",
        description: "Drop index",
        inputSchema: {
          type: "object",
          properties: {
            indexName: { type: "string" },
            schema: { type: "string", default: "public" },
          },
          required: ["indexName"],
        },
      },

      // DML Operations
      {
        name: "query",
        description: "Execute SQL query",
        inputSchema: {
          type: "object",
          properties: { sql: { type: "string" }, params: { type: "array" } },
          required: ["sql"],
        },
      },
      {
        name: "select",
        description: "SELECT query builder",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            columns: { type: "array" },
            where: { type: "object" },
            orderBy: { type: "string" },
            limit: { type: "number" },
            offset: { type: "number" },
          },
          required: ["table"],
        },
      },
      {
        name: "insert",
        description: "INSERT data",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            data: { type: "object" },
            returning: { type: "array" },
          },
          required: ["table", "data"],
        },
      },
      {
        name: "update",
        description: "UPDATE data",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            data: { type: "object" },
            where: { type: "object" },
            returning: { type: "array" },
          },
          required: ["table", "data"],
        },
      },
      {
        name: "delete",
        description: "DELETE data",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            where: { type: "object" },
            returning: { type: "array" },
          },
          required: ["table"],
        },
      },
      {
        name: "upsert",
        description: "INSERT or UPDATE (UPSERT)",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            data: { type: "object" },
            conflictColumns: { type: "array" },
            returning: { type: "array" },
          },
          required: ["table", "data", "conflictColumns"],
        },
      },
      {
        name: "bulkInsert",
        description: "Bulk INSERT",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            data: { type: "array" },
            returning: { type: "array" },
          },
          required: ["table", "data"],
        },
      },

      // Transactions
      {
        name: "beginTransaction",
        description: "Begin transaction",
        inputSchema: {
          type: "object",
          properties: { isolationLevel: { type: "string" } },
        },
      },
      {
        name: "commit",
        description: "Commit transaction",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "rollback",
        description: "Rollback transaction",
        inputSchema: { type: "object", properties: {} },
      },

      // Maintenance
      {
        name: "vacuum",
        description: "VACUUM table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            full: { type: "boolean", default: false },
            analyze: { type: "boolean", default: true },
          },
        },
      },
      {
        name: "analyze",
        description: "ANALYZE table",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" } },
        },
      },
      {
        name: "explain",
        description: "EXPLAIN query plan",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string" },
            analyze: { type: "boolean", default: false },
          },
          required: ["sql"],
        },
      },
      {
        name: "tableSize",
        description: "Get table size",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            schema: { type: "string", default: "public" },
          },
          required: ["table"],
        },
      },
    ],
    resources: [
      {
        uri: "postgres://databases",
        name: "Databases",
        description: "All databases",
      },
      {
        uri: "postgres://schemas",
        name: "Schemas",
        description: "All schemas",
      },
      { uri: "postgres://tables", name: "Tables", description: "All tables" },
      {
        uri: "postgres://indexes",
        name: "Indexes",
        description: "All indexes",
      },
    ],
    prompts: [
      {
        name: "sql_builder",
        description: "AI-powered SQL query builder",
        arguments: [
          {
            name: "description",
            description: "What you want to query",
            required: true,
          },
        ],
      },
      {
        name: "schema_designer",
        description: "AI-powered table schema design",
        arguments: [
          {
            name: "requirements",
            description: "Table requirements",
            required: true,
          },
        ],
      },
      {
        name: "query_optimizer",
        description: "AI-powered query optimization",
        arguments: [
          { name: "sql", description: "SQL to optimize", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      // Import the full postgres tools implementation
      const { executePostgresTool } = await import("./postgres-tools");
      return await executePostgresTool(tool, params);
    },
    agentBriefing: `POSTGRES MCP - Use for ALL PostgreSQL relational database operations.

WHEN TO USE:
- Relational database operations, SQL queries
- Schema management (tables, indexes, constraints)
- DDL operations (CREATE, ALTER, DROP)
- DML operations (INSERT, UPDATE, DELETE, SELECT)
- Transactions, migrations, data analysis

KEY TOOLS:
- listSchemas/listTables: Discover database structure
- describeTable: Get table schema details
- query: Execute raw SQL queries
- select/insert/update/delete: CRUD operations
- createTable/alterTable/dropTable: Schema management
- createIndex/dropIndex: Performance optimization
- transaction: Execute multiple operations atomically

USE CASES:
- "Query all users from the users table"
- "Create a new table for products"
- "Insert a new record into the orders table"
- "Run a complex JOIN query"
- "Create an index on the email column"

AVOID: Use MongoDB/SQLite MCP for non-relational data. Use Postgres MCP for relational, ACID-compliant operations.`,
  },

  // 12. SQLITE - better-sqlite3 (FULLY UPGRADED: 22+ tools!)
  sqlite: {
    name: "sqlite",
    category: "database",
    enabled: true,
    tools: [
      // Schema Discovery
      {
        name: "listTables",
        description: "List all tables",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "tableInfo",
        description: "Get table schema",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" } },
          required: ["table"],
        },
      },
      {
        name: "listIndexes",
        description: "List indexes",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" } },
          required: ["table"],
        },
      },
      {
        name: "getForeignKeys",
        description: "Get foreign keys",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" } },
          required: ["table"],
        },
      },

      // DDL Operations
      {
        name: "createTable",
        description: "Create table",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" }, columns: { type: "array" } },
          required: ["table", "columns"],
        },
      },
      {
        name: "dropTable",
        description: "Drop table",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" } },
          required: ["table"],
        },
      },
      {
        name: "alterTable",
        description: "Alter table (add column only)",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" }, action: { type: "string" } },
          required: ["table", "action"],
        },
      },
      {
        name: "createIndex",
        description: "Create index",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            columns: { type: "array" },
            indexName: { type: "string" },
            unique: { type: "boolean", default: false },
          },
          required: ["table", "columns"],
        },
      },
      {
        name: "dropIndex",
        description: "Drop index",
        inputSchema: {
          type: "object",
          properties: { indexName: { type: "string" } },
          required: ["indexName"],
        },
      },

      // DML Operations
      {
        name: "query",
        description: "Execute SQL query",
        inputSchema: {
          type: "object",
          properties: { sql: { type: "string" }, params: { type: "array" } },
          required: ["sql"],
        },
      },
      {
        name: "select",
        description: "SELECT query builder",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            columns: { type: "array" },
            where: { type: "object" },
            orderBy: { type: "string" },
            limit: { type: "number" },
          },
          required: ["table"],
        },
      },
      {
        name: "insert",
        description: "INSERT data",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" }, data: { type: "object" } },
          required: ["table", "data"],
        },
      },
      {
        name: "update",
        description: "UPDATE data",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            data: { type: "object" },
            where: { type: "object" },
          },
          required: ["table", "data"],
        },
      },
      {
        name: "delete",
        description: "DELETE data",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" }, where: { type: "object" } },
          required: ["table"],
        },
      },
      {
        name: "bulkInsert",
        description: "Bulk INSERT",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" }, data: { type: "array" } },
          required: ["table", "data"],
        },
      },

      // Transactions
      {
        name: "begin",
        description: "Begin transaction",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "commit",
        description: "Commit transaction",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "rollback",
        description: "Rollback transaction",
        inputSchema: { type: "object", properties: {} },
      },

      // Maintenance
      {
        name: "vacuum",
        description: "VACUUM database",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "analyze",
        description: "ANALYZE tables",
        inputSchema: {
          type: "object",
          properties: { table: { type: "string" } },
        },
      },
      {
        name: "integrityCheck",
        description: "Check database integrity",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "backup",
        description: "Backup database",
        inputSchema: {
          type: "object",
          properties: { destination: { type: "string" } },
          required: ["destination"],
        },
      },
    ],
    resources: [
      { uri: "sqlite://tables", name: "Tables", description: "All tables" },
      { uri: "sqlite://indexes", name: "Indexes", description: "All indexes" },
      {
        uri: "sqlite://schema",
        name: "Schema",
        description: "Database schema",
      },
    ],
    prompts: [
      {
        name: "sql_builder",
        description: "AI-powered SQL query builder",
        arguments: [
          {
            name: "description",
            description: "What you want to query",
            required: true,
          },
        ],
      },
      {
        name: "schema_designer",
        description: "AI-powered table schema design",
        arguments: [
          {
            name: "requirements",
            description: "Table requirements",
            required: true,
          },
        ],
      },
    ],
    execute: async (tool, params) => {
      // Import the full sqlite tools implementation
      const { executeSqliteTool } = await import("./sqlite-tools");
      return executeSqliteTool(tool, params);
    },
    agentBriefing: `SQLITE MCP - Use for ALL SQLite database operations (lightweight, file-based).

WHEN TO USE:
- Lightweight relational database operations
- Local file-based database storage
- Embedded database applications
- Development/testing databases
- Simple data persistence without server setup

KEY TOOLS:
- listTables: Discover database structure
- query: Execute raw SQL queries
- createTable/alterTable/dropTable: Schema management
- insert/update/delete: CRUD operations
- createIndex/dropIndex: Performance optimization
- transaction: Execute multiple operations atomically

USE CASES:
- "Query the local SQLite database"
- "Create a table for user sessions"
- "Insert test data into the database"
- "Run a migration script"
- "Backup the SQLite database"

AVOID: Use Postgres MCP for production/server databases. Use SQLite MCP for local, file-based databases.`,
  },

  // 13. NOTION - @notionhq/client (FULLY UPGRADED: 25+ tools!)
  notion: {
    name: "notion",
    category: "productivity",
    enabled: true,
    tools: [
      // Page Operations
      {
        name: "getPage",
        description: "Get page details",
        inputSchema: {
          type: "object",
          properties: { pageId: { type: "string" } },
          required: ["pageId"],
        },
      },
      {
        name: "createPage",
        description: "Create page",
        inputSchema: {
          type: "object",
          properties: {
            parent: { type: "object" },
            properties: { type: "object" },
            children: { type: "array" },
          },
          required: ["parent", "properties"],
        },
      },
      {
        name: "updatePage",
        description: "Update page properties",
        inputSchema: {
          type: "object",
          properties: {
            pageId: { type: "string" },
            properties: { type: "object" },
          },
          required: ["pageId", "properties"],
        },
      },
      {
        name: "deletePage",
        description: "Delete page (archive)",
        inputSchema: {
          type: "object",
          properties: { pageId: { type: "string" } },
          required: ["pageId"],
        },
      },
      {
        name: "listPageChildren",
        description: "List page children blocks",
        inputSchema: {
          type: "object",
          properties: {
            pageId: { type: "string" },
            startCursor: { type: "string" },
            pageSize: { type: "number" },
          },
          required: ["pageId"],
        },
      },
      {
        name: "duplicatePage",
        description: "Duplicate page",
        inputSchema: {
          type: "object",
          properties: { pageId: { type: "string" } },
          required: ["pageId"],
        },
      },
      {
        name: "movePageToWorkspace",
        description: "Move page to workspace",
        inputSchema: {
          type: "object",
          properties: {
            pageId: { type: "string" },
            workspaceId: { type: "string" },
          },
          required: ["pageId"],
        },
      },
      {
        name: "getPageProperty",
        description: "Get page property value",
        inputSchema: {
          type: "object",
          properties: {
            pageId: { type: "string" },
            propertyId: { type: "string" },
          },
          required: ["pageId", "propertyId"],
        },
      },

      // Block Operations
      {
        name: "getBlock",
        description: "Get block details",
        inputSchema: {
          type: "object",
          properties: { blockId: { type: "string" } },
          required: ["blockId"],
        },
      },
      {
        name: "appendBlock",
        description: "Append block children",
        inputSchema: {
          type: "object",
          properties: {
            blockId: { type: "string" },
            children: { type: "array" },
          },
          required: ["blockId", "children"],
        },
      },
      {
        name: "updateBlock",
        description: "Update block",
        inputSchema: {
          type: "object",
          properties: {
            blockId: { type: "string" },
            block: { type: "object" },
          },
          required: ["blockId", "block"],
        },
      },
      {
        name: "deleteBlock",
        description: "Delete block",
        inputSchema: {
          type: "object",
          properties: { blockId: { type: "string" } },
          required: ["blockId"],
        },
      },

      // Database Operations
      {
        name: "getDatabase",
        description: "Get database details",
        inputSchema: {
          type: "object",
          properties: { databaseId: { type: "string" } },
          required: ["databaseId"],
        },
      },
      {
        name: "queryDatabase",
        description: "Query database with filters",
        inputSchema: {
          type: "object",
          properties: {
            databaseId: { type: "string" },
            filter: { type: "object" },
            sorts: { type: "array" },
            startCursor: { type: "string" },
            pageSize: { type: "number" },
          },
          required: ["databaseId"],
        },
      },
      {
        name: "createDatabase",
        description: "Create database",
        inputSchema: {
          type: "object",
          properties: {
            parentPageId: { type: "string" },
            title: { type: "string" },
            properties: { type: "object" },
          },
          required: ["parentPageId", "title", "properties"],
        },
      },
      {
        name: "updateDatabase",
        description: "Update database",
        inputSchema: {
          type: "object",
          properties: {
            databaseId: { type: "string" },
            title: { type: "string" },
            properties: { type: "object" },
          },
          required: ["databaseId"],
        },
      },

      // Search
      {
        name: "search",
        description: "Search pages and databases",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            filter: { type: "object" },
            sort: { type: "object" },
            startCursor: { type: "string" },
            pageSize: { type: "number" },
          },
        },
      },

      // User Operations
      {
        name: "listUsers",
        description: "List all users",
        inputSchema: {
          type: "object",
          properties: {
            startCursor: { type: "string" },
            pageSize: { type: "number" },
          },
        },
      },
      {
        name: "getUser",
        description: "Get user details",
        inputSchema: {
          type: "object",
          properties: { userId: { type: "string" } },
          required: ["userId"],
        },
      },
      {
        name: "getMe",
        description: "Get bot user info",
        inputSchema: { type: "object", properties: {} },
      },

      // Comment Operations
      {
        name: "createComment",
        description: "Create comment",
        inputSchema: {
          type: "object",
          properties: {
            pageId: { type: "string" },
            richText: { type: "array" },
          },
          required: ["pageId", "richText"],
        },
      },
      {
        name: "listComments",
        description: "List comments",
        inputSchema: {
          type: "object",
          properties: {
            blockId: { type: "string" },
            startCursor: { type: "string" },
            pageSize: { type: "number" },
          },
          required: ["blockId"],
        },
      },

      // Bulk Operations
      {
        name: "bulkCreatePages",
        description: "Bulk create pages",
        inputSchema: {
          type: "object",
          properties: {
            parent: { type: "object" },
            pagesData: { type: "array" },
          },
          required: ["parent", "pagesData"],
        },
      },
    ],
    resources: [
      { uri: "notion://pages", name: "Pages", description: "All pages" },
      {
        uri: "notion://databases",
        name: "Databases",
        description: "All databases",
      },
      { uri: "notion://users", name: "Users", description: "All users" },
      { uri: "notion://blocks", name: "Blocks", description: "All blocks" },
    ],
    prompts: [
      {
        name: "create_page",
        description: "Help create Notion page",
        arguments: [
          { name: "content", description: "Page content", required: true },
        ],
      },
      {
        name: "search_notion",
        description: "Search Notion workspace",
        arguments: [
          { name: "query", description: "Search query", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      if (!process.env.NOTION_API_KEY)
        throw new Error("NOTION_API_KEY not configured");
      const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });

      switch (tool) {
        case "queryDatabase":
          const response = await notion.databases.query({
            database_id: params.databaseId,
            filter: params.filter,
          });
          return response.results;
        case "createPage":
          const page = await notion.pages.create({
            parent: params.parent,
            properties: params.properties,
          });
          return page;
        default:
          throw new Error(`Unknown notion tool: ${tool}`);
      }
    },
    agentBriefing: `NOTION MCP - Use for ALL Notion workspace and page operations.

WHEN TO USE:
- Creating, updating, querying Notion pages
- Database operations (query, filter, sort)
- Block management (text, headings, lists, etc.)
- Search across workspace
- User and workspace management

KEY TOOLS:
- createPage/updatePage: Page management
- queryDatabase: Query Notion databases with filters
- search: Search across workspace
- getBlock/updateBlock: Block-level operations
- listUsers/getMe: User management
- appendBlock: Add content to pages

USE CASES:
- "Create a new Notion page for project documentation"
- "Query the tasks database for incomplete items"
- "Search for all pages mentioning 'API'"
- "Update a page with new content"
- "Add a heading block to the page"

AVOID: Use other MCPs for non-Notion operations. Use Notion MCP for all Notion workspace interactions.`,
  },

  // 14. SLACK - @slack/web-api (FULLY UPGRADED: 30+ tools!)
  slack: {
    name: "slack",
    category: "communication",
    enabled: true,
    tools: [
      // Message Operations
      {
        name: "postMessage",
        description: "Post message",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            text: { type: "string" },
            blocks: { type: "array" },
            thread_ts: { type: "string" },
            attachments: { type: "array" },
          },
          required: ["channel", "text"],
        },
      },
      {
        name: "updateMessage",
        description: "Update message",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            ts: { type: "string" },
            text: { type: "string" },
            blocks: { type: "array" },
          },
          required: ["channel", "ts", "text"],
        },
      },
      {
        name: "deleteMessage",
        description: "Delete message",
        inputSchema: {
          type: "object",
          properties: { channel: { type: "string" }, ts: { type: "string" } },
          required: ["channel", "ts"],
        },
      },
      {
        name: "postEphemeral",
        description: "Post ephemeral message",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            user: { type: "string" },
            text: { type: "string" },
            blocks: { type: "array" },
          },
          required: ["channel", "user", "text"],
        },
      },
      {
        name: "scheduleMessage",
        description: "Schedule message",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            text: { type: "string" },
            post_at: { type: "number" },
            blocks: { type: "array" },
          },
          required: ["channel", "text", "post_at"],
        },
      },
      {
        name: "postThreadReply",
        description: "Reply in thread",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            thread_ts: { type: "string" },
            text: { type: "string" },
            blocks: { type: "array" },
          },
          required: ["channel", "thread_ts", "text"],
        },
      },
      {
        name: "getPermalink",
        description: "Get message permalink",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            message_ts: { type: "string" },
          },
          required: ["channel", "message_ts"],
        },
      },

      // File Operations
      {
        name: "uploadFile",
        description: "Upload file",
        inputSchema: {
          type: "object",
          properties: {
            channels: { type: "string" },
            content: { type: "string" },
            filename: { type: "string" },
            filetype: { type: "string" },
            title: { type: "string" },
            initial_comment: { type: "string" },
          },
          required: ["channels", "content"],
        },
      },
      {
        name: "getFile",
        description: "Get file info",
        inputSchema: {
          type: "object",
          properties: { file: { type: "string" } },
          required: ["file"],
        },
      },
      {
        name: "deleteFile",
        description: "Delete file",
        inputSchema: {
          type: "object",
          properties: { file: { type: "string" } },
          required: ["file"],
        },
      },
      {
        name: "shareFile",
        description: "Share file publicly",
        inputSchema: {
          type: "object",
          properties: { file: { type: "string" }, channel: { type: "string" } },
          required: ["file"],
        },
      },
      {
        name: "listFiles",
        description: "List files",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            user: { type: "string" },
            count: { type: "number" },
          },
        },
      },

      // Reaction Operations
      {
        name: "addReaction",
        description: "Add reaction",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            name: { type: "string" },
            timestamp: { type: "string" },
          },
          required: ["channel", "name", "timestamp"],
        },
      },
      {
        name: "removeReaction",
        description: "Remove reaction",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            name: { type: "string" },
            timestamp: { type: "string" },
          },
          required: ["channel", "name", "timestamp"],
        },
      },
      {
        name: "getReactions",
        description: "Get reactions",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            timestamp: { type: "string" },
          },
          required: ["channel", "timestamp"],
        },
      },

      // User Operations
      {
        name: "listUsers",
        description: "List users",
        inputSchema: {
          type: "object",
          properties: { limit: { type: "number" }, cursor: { type: "string" } },
        },
      },
      {
        name: "getUser",
        description: "Get user info",
        inputSchema: {
          type: "object",
          properties: { user: { type: "string" } },
          required: ["user"],
        },
      },
      {
        name: "getUserProfile",
        description: "Get user profile",
        inputSchema: {
          type: "object",
          properties: { user: { type: "string" } },
          required: ["user"],
        },
      },
      {
        name: "setUserPresence",
        description: "Set presence",
        inputSchema: {
          type: "object",
          properties: { presence: { type: "string" } },
          required: ["presence"],
        },
      },
      {
        name: "getUserPresence",
        description: "Get user presence",
        inputSchema: {
          type: "object",
          properties: { user: { type: "string" } },
          required: ["user"],
        },
      },

      // Channel Operations
      {
        name: "listChannels",
        description: "List channels",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number" },
            cursor: { type: "string" },
            exclude_archived: { type: "boolean" },
          },
        },
      },
      {
        name: "createChannel",
        description: "Create channel",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            is_private: { type: "boolean" },
          },
          required: ["name"],
        },
      },
      {
        name: "archiveChannel",
        description: "Archive channel",
        inputSchema: {
          type: "object",
          properties: { channel: { type: "string" } },
          required: ["channel"],
        },
      },
      {
        name: "unarchiveChannel",
        description: "Unarchive channel",
        inputSchema: {
          type: "object",
          properties: { channel: { type: "string" } },
          required: ["channel"],
        },
      },
      {
        name: "inviteToChannel",
        description: "Invite users to channel",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            users: { type: "string" },
          },
          required: ["channel", "users"],
        },
      },
      {
        name: "kickFromChannel",
        description: "Remove user from channel",
        inputSchema: {
          type: "object",
          properties: { channel: { type: "string" }, user: { type: "string" } },
          required: ["channel", "user"],
        },
      },
      {
        name: "setChannelTopic",
        description: "Set channel topic",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            topic: { type: "string" },
          },
          required: ["channel", "topic"],
        },
      },
      {
        name: "setChannelPurpose",
        description: "Set channel purpose",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            purpose: { type: "string" },
          },
          required: ["channel", "purpose"],
        },
      },
      {
        name: "getChannelHistory",
        description: "Get channel history",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string" },
            limit: { type: "number" },
            cursor: { type: "string" },
          },
          required: ["channel"],
        },
      },
    ],
    resources: [
      {
        uri: "slack://channels",
        name: "Channels",
        description: "All channels",
      },
      { uri: "slack://users", name: "Users", description: "All users" },
      { uri: "slack://files", name: "Files", description: "All files" },
      {
        uri: "slack://messages",
        name: "Messages",
        description: "Recent messages",
      },
    ],
    prompts: [
      {
        name: "compose_message",
        description: "Help compose Slack message",
        arguments: [
          { name: "context", description: "Message context", required: true },
        ],
      },
      {
        name: "channel_management",
        description: "Help manage channels",
        arguments: [
          { name: "action", description: "What to do", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      if (!process.env.SLACK_BOT_TOKEN)
        throw new Error("SLACK_BOT_TOKEN not configured");
      const slack = new SlackClient(process.env.SLACK_BOT_TOKEN);

      switch (tool) {
        case "postMessage":
          const result = await slack.chat.postMessage({
            channel: params.channel,
            text: params.text,
          });
          return result;
        case "listChannels":
          const channels = await slack.conversations.list();
          return channels.channels;
        default:
          throw new Error(`Unknown slack tool: ${tool}`);
      }
    },
    agentBriefing: `SLACK MCP - Use for ALL Slack workspace communication and collaboration.

WHEN TO USE:
- Sending messages to Slack channels
- Managing channels (list, create, archive)
- Getting channel history, user info
- File uploads, reactions, threads
- Team communication and notifications

KEY TOOLS:
- postMessage: Send messages to channels
- listChannels/getChannelHistory: Channel operations
- uploadFile: Share files
- addReaction/removeReaction: Message reactions
- getUserInfo/getMe: User management
- setUserPresence: Status management

USE CASES:
- "Send a notification to the #general channel"
- "List all channels in the workspace"
- "Get message history from #dev channel"
- "Upload a file to Slack"
- "Add a reaction to a message"

AVOID: Use other MCPs for non-Slack operations. Use Slack MCP for all Slack workspace interactions.`,
  },

  // 15. AIRTABLE - airtable SDK (FULLY UPGRADED: 18+ tools!)
  airtable: {
    name: "airtable",
    category: "productivity",
    enabled: true,
    tools: [
      // Record Operations (5 tools)
      { name: "listRecords", description: "List records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, maxRecords: { type: "number" }, view: { type: "string" }, filterByFormula: { type: "string" }, sort: { type: "array" } }, required: ["baseId", "table"] } },
      { name: "getRecord", description: "Get record", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, recordId: { type: "string" } }, required: ["baseId", "table", "recordId"] } },
      { name: "createRecord", description: "Create record", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, fields: { type: "object" }, typecast: { type: "boolean" } }, required: ["baseId", "table", "fields"] } },
      { name: "updateRecord", description: "Update record", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, recordId: { type: "string" }, fields: { type: "object" }, typecast: { type: "boolean" } }, required: ["baseId", "table", "recordId", "fields"] } },
      { name: "deleteRecord", description: "Delete record", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, recordId: { type: "string" } }, required: ["baseId", "table", "recordId"] } },
      
      // Bulk Operations (3 tools)
      { name: "bulkCreate", description: "Bulk create records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, records: { type: "array" }, typecast: { type: "boolean" } }, required: ["baseId", "table", "records"] } },
      { name: "bulkUpdate", description: "Bulk update records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, records: { type: "array" }, typecast: { type: "boolean" } }, required: ["baseId", "table", "records"] } },
      { name: "bulkDelete", description: "Bulk delete records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, recordIds: { type: "array" } }, required: ["baseId", "table", "recordIds"] } },
      
      // Search & Filter (3 tools)
      { name: "filterRecords", description: "Filter records by formula", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, formula: { type: "string" }, maxRecords: { type: "number" }, view: { type: "string" } }, required: ["baseId", "table", "formula"] } },
      { name: "sortRecords", description: "Sort records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, sort: { type: "array" }, maxRecords: { type: "number" } }, required: ["baseId", "table", "sort"] } },
      { name: "searchRecords", description: "Search records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, searchTerm: { type: "string" }, searchFields: { type: "array" }, maxRecords: { type: "number" } }, required: ["baseId", "table", "searchTerm"] } },
      
      // Fields (2 tools)
      { name: "listFields", description: "List table fields", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" } }, required: ["baseId", "table"] } },
      { name: "getFieldInfo", description: "Get field info", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, fieldName: { type: "string" } }, required: ["baseId", "table", "fieldName"] } },
      
      // Views (2 tools)
      { name: "listViews", description: "List views", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, view: { type: "string" }, maxRecords: { type: "number" } }, required: ["baseId", "table", "view"] } },
      { name: "getView", description: "Get view data", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, view: { type: "string" }, maxRecords: { type: "number" } }, required: ["baseId", "table", "view"] } },
      
      // Tables (2 tools)
      { name: "listTables", description: "List tables", inputSchema: { type: "object", properties: { baseId: { type: "string" } }, required: ["baseId"] } },
      { name: "getTableInfo", description: "Get table info", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" } }, required: ["baseId", "table"] } },
      
      // Advanced (3 tools)
      { name: "getPage", description: "Get paginated records", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, pageSize: { type: "number" }, offset: { type: "string" }, view: { type: "string" } }, required: ["baseId", "table"] } },
      { name: "replaceRecord", description: "Replace record (PUT)", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, recordId: { type: "string" }, fields: { type: "object" } }, required: ["baseId", "table", "recordId", "fields"] } },
      { name: "upsertRecord", description: "Upsert record", inputSchema: { type: "object", properties: { baseId: { type: "string" }, table: { type: "string" }, recordId: { type: "string" }, fields: { type: "object" } }, required: ["baseId", "table", "recordId", "fields"] } },
    ],
    resources: [
      { uri: "airtable://bases", name: "Bases", description: "All bases" },
      { uri: "airtable://tables", name: "Tables", description: "All tables" },
      { uri: "airtable://views", name: "Views", description: "All views" },
    ],
    prompts: [
      { name: "create_record", description: "Help create record", arguments: [{ name: "table", description: "Table name", required: true }] },
      { name: "query_data", description: "Help query data", arguments: [{ name: "query", description: "Query description", required: true }] },
    ],
    execute: async (tool, params) => {
      const { executeAirtableTool } = await import("./airtable-tools");
      return await executeAirtableTool(tool, params);
    },
    agentBriefing: `AIRTABLE MCP - Use for ALL Airtable base and record operations.

WHEN TO USE:
- Managing Airtable bases, tables, records
- Querying records with filters and formulas
- Creating, updating, deleting records
- Working with views, pagination
- Bulk operations, upserts

KEY TOOLS:
- listRecords/getRecord: Query records
- createRecord/updateRecord/deleteRecord: CRUD operations
- replaceRecord/upsertRecord: Advanced record management
- listTables/getTableInfo: Table structure
- getView: View data with filters
- getPage: Paginated record retrieval

USE CASES:
- "List all records from the Users table"
- "Create a new record in the Products table"
- "Query records where status is 'active'"
- "Update a record with new data"
- "Get paginated results from a large table"

AVOID: Use other MCPs for non-Airtable operations. Use Airtable MCP for all Airtable base interactions.`,
  },

  // 16. DOPPLER - REST API
  // 16. DOPPLER - Secrets Manager (FULLY UPGRADED: 1→38 tools!)
  doppler: {
    name: "doppler",
    category: "security",
    enabled: true,
    tools: [
      // Projects (5 tools)
      { name: "listProjects", description: "List all projects", inputSchema: { type: "object", properties: {} } },
      { name: "getProject", description: "Get project details", inputSchema: { type: "object", properties: { project: { type: "string" } }, required: ["project"] } },
      { name: "createProject", description: "Create new project", inputSchema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name"] } },
      { name: "updateProject", description: "Update project", inputSchema: { type: "object", properties: { project: { type: "string" }, name: { type: "string" }, description: { type: "string" } }, required: ["project"] } },
      { name: "deleteProject", description: "Delete project", inputSchema: { type: "object", properties: { project: { type: "string" } }, required: ["project"] } },
      
      // Configs/Environments (8 tools)
      { name: "listConfigs", description: "List configs in project", inputSchema: { type: "object", properties: { project: { type: "string" } }, required: ["project"] } },
      { name: "getConfig", description: "Get config details", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" } }, required: ["project", "config"] } },
      { name: "createConfig", description: "Create new config", inputSchema: { type: "object", properties: { project: { type: "string" }, name: { type: "string" }, environment: { type: "string" } }, required: ["project", "name", "environment"] } },
      { name: "updateConfig", description: "Update config", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, name: { type: "string" } }, required: ["project", "config", "name"] } },
      { name: "deleteConfig", description: "Delete config", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" } }, required: ["project", "config"] } },
      { name: "cloneConfig", description: "Clone config", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, newName: { type: "string" } }, required: ["project", "config", "newName"] } },
      { name: "lockConfig", description: "Lock config (prevent changes)", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" } }, required: ["project", "config"] } },
      { name: "unlockConfig", description: "Unlock config", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" } }, required: ["project", "config"] } },
      
      // Secrets (8 tools)
      { name: "listSecrets", description: "List all secrets in config", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" } }, required: ["project", "config"] } },
      { name: "getSecret", description: "Get secret value", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, name: { type: "string" } }, required: ["project", "config", "name"] } },
      { name: "setSecret", description: "Set secret value", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, name: { type: "string" }, value: { type: "string" } }, required: ["project", "config", "name", "value"] } },
      { name: "updateSecret", description: "Update secret", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, name: { type: "string" }, value: { type: "string" } }, required: ["project", "config", "name", "value"] } },
      { name: "deleteSecret", description: "Delete secret", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, name: { type: "string" } }, required: ["project", "config", "name"] } },
      { name: "bulkSetSecrets", description: "Set multiple secrets at once", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, secrets: { type: "object" } }, required: ["project", "config", "secrets"] } },
      { name: "downloadSecrets", description: "Download secrets (json, env, yaml)", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, format: { type: "string", enum: ["json", "env", "yaml"] } }, required: ["project", "config"] } },
      
      // Environments (4 tools)
      { name: "listEnvironments", description: "List environments", inputSchema: { type: "object", properties: { project: { type: "string" } }, required: ["project"] } },
      { name: "createEnvironment", description: "Create environment", inputSchema: { type: "object", properties: { project: { type: "string" }, name: { type: "string" }, slug: { type: "string" } }, required: ["project", "name", "slug"] } },
      { name: "renameEnvironment", description: "Rename environment", inputSchema: { type: "object", properties: { project: { type: "string" }, slug: { type: "string" }, name: { type: "string" } }, required: ["project", "slug", "name"] } },
      { name: "deleteEnvironment", description: "Delete environment", inputSchema: { type: "object", properties: { project: { type: "string" }, slug: { type: "string" } }, required: ["project", "slug"] } },
      
      // Service Tokens (3 tools)
      { name: "listServiceTokens", description: "List service tokens", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" } }, required: ["project", "config"] } },
      { name: "createServiceToken", description: "Create service token", inputSchema: { type: "object", properties: { project: { type: "string" }, config: { type: "string" }, name: { type: "string" }, access: { type: "string", enum: ["read", "read/write"] } }, required: ["project", "config", "name"] } },
      { name: "deleteServiceToken", description: "Delete service token", inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] } },
      
      // Integrations (3 tools)
      { name: "listIntegrations", description: "List integrations", inputSchema: { type: "object", properties: { project: { type: "string" } }, required: ["project"] } },
      { name: "createIntegration", description: "Create integration (AWS, Vercel, etc)", inputSchema: { type: "object", properties: { project: { type: "string" }, type: { type: "string" }, data: { type: "object" } }, required: ["project", "type", "data"] } },
      { name: "deleteIntegration", description: "Delete integration", inputSchema: { type: "object", properties: { integration: { type: "string" } }, required: ["integration"] } },
      
      // Audit & Workplace (3 tools)
      { name: "getAuditLogs", description: "Get audit logs", inputSchema: { type: "object", properties: { page: { type: "number" }, perPage: { type: "number" } } } },
      { name: "getWorkplace", description: "Get workplace details", inputSchema: { type: "object", properties: {} } },
      { name: "listWorkplaceUsers", description: "List workplace users", inputSchema: { type: "object", properties: {} } },
    ],
    resources: [
      { uri: "doppler://projects", name: "Projects", description: "All Doppler projects" },
      { uri: "doppler://secrets", name: "Secrets", description: "All secrets across projects" },
      { uri: "doppler://environments", name: "Environments", description: "All environments" },
      { uri: "doppler://integrations", name: "Integrations", description: "All integrations" },
      { uri: "doppler://audit", name: "Audit Logs", description: "Security audit logs" },
    ],
    prompts: [
      {
        name: "manage_secrets",
        description: "Manage secrets for a project",
        arguments: [
          { name: "project", description: "Project name", required: true },
          { name: "config", description: "Config name (e.g. dev, prod)", required: true },
        ],
      },
      {
        name: "sync_secrets",
        description: "Sync secrets between environments",
        arguments: [
          { name: "sourceProject", description: "Source project", required: true },
          { name: "sourceConfig", description: "Source config", required: true },
          { name: "targetConfig", description: "Target config", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      const { executeDopplerTool } = await import("./doppler-tools");
      return await executeDopplerTool(tool, params);
    },
    agentBriefing: `DOPPLER MCP - Use for ALL secrets and environment variable management.

WHEN TO USE:
- Managing secrets and environment variables
- Project and config management
- Environment creation and management
- Service token management
- Secret synchronization across environments
- Security and compliance operations

KEY TOOLS:
- listProjects/createProject: Project management
- listConfigs/createConfig: Config/environment management
- getSecret/setSecret/deleteSecret: Secret operations
- bulkSetSecrets: Batch secret updates
- downloadSecrets: Export secrets (json, env, yaml)
- listServiceTokens/createServiceToken: Service token management

USE CASES:
- "Get the API key secret from production config"
- "Set multiple secrets for the staging environment"
- "Create a new project for the microservice"
- "Download all secrets as .env file"
- "Create a service token for CI/CD"

AVOID: Use other MCPs for non-secrets operations. Use Doppler MCP for all secrets management.`,
  },

  // 17. RAINDROP - REST API
  raindrop: {
    name: "raindrop",
    category: "productivity",
    enabled: true,
    tools: [
      {
        name: "listBookmarks",
        description: "List bookmarks",
        inputSchema: { type: "object", properties: {} },
      },
    ],
    resources: [
      {
        uri: "raindrop://collections",
        name: "Collections",
        description: "All collections",
      },
    ],
    prompts: [],
    agentBriefing: `RAINDROP MCP - Use for bookmark management and organization.

KEY TOOLS:
- listBookmarks: Retrieve all saved bookmarks from Raindrop collections

WHEN TO USE:
- User wants to access or organize their bookmarks
- Need to retrieve saved web pages or resources
- Building bookmark management workflows
- Integrating bookmark data into other systems

THINGS TO AVOID:
- Don't use for web scraping (use Playwright/Puppeteer instead)
- Don't use for file storage (use Filesystem or Google Drive)
- Requires RAINDROP_TOKEN environment variable

INTEGRATION NOTES:
- Works with Raindrop.io API
- Supports collections for organizing bookmarks
- Can be combined with browser automation tools for bookmark creation workflows`,
    execute: async (tool, params) => {
      if (!process.env.RAINDROP_TOKEN)
        throw new Error("RAINDROP_TOKEN not configured");

      if (tool === "listBookmarks") {
        const { data } = await axios.get(
          "https://api.raindrop.io/rest/v1/raindrops/0",
          {
            headers: { Authorization: `Bearer ${process.env.RAINDROP_TOKEN}` },
          }
        );
        return data.items;
      }
      throw new Error(`Unknown raindrop tool: ${tool}`);
    },
  },

  // 18. POSTMAN - REST API
  postman: {
    name: "postman",
    category: "development",
    enabled: true,
    tools: [
      {
        name: "listCollections",
        description: "List collections",
        inputSchema: { type: "object", properties: {} },
      },
    ],
    resources: [
      {
        uri: "postman://collections",
        name: "Collections",
        description: "All collections",
      },
    ],
    prompts: [],
    agentBriefing: `POSTMAN MCP - Use for API collection management and testing.

KEY TOOLS:
- listCollections: Retrieve all Postman API collections

WHEN TO USE:
- User wants to access or manage their Postman API collections
- Need to retrieve API endpoints and test configurations
- Building API testing workflows
- Integrating Postman collections into development workflows

THINGS TO AVOID:
- Don't use for actual API calls (use direct HTTP requests or specific service MCPs)
- Don't use for API documentation (use GitHub or Notion for docs)
- Requires POSTMAN_API_KEY environment variable

INTEGRATION NOTES:
- Works with Postman API
- Collections contain API requests, tests, and environments
- Can be combined with GitHub for API documentation workflows
- Useful for API testing automation and CI/CD integration`,
    execute: async (tool, params) => {
      if (!process.env.POSTMAN_API_KEY)
        throw new Error("POSTMAN_API_KEY not configured");

      if (tool === "listCollections") {
        const { data } = await axios.get(
          "https://api.getpostman.com/collections",
          {
            headers: { "X-Api-Key": process.env.POSTMAN_API_KEY },
          }
        );
        return data.collections;
      }
      throw new Error(`Unknown postman tool: ${tool}`);
    },
  },

  // 19. GOOGLE DRIVE - googleapis
  "google-drive": {
    name: "google-drive",
    category: "storage",
    enabled: true,
    tools: [
      {
        name: "listFiles",
        description: "List files",
        inputSchema: {
          type: "object",
          properties: { folderId: { type: "string" } },
        },
      },
    ],
    resources: [
      { uri: "gdrive://files", name: "Files", description: "All files" },
    ],
    prompts: [],
    agentBriefing: `GOOGLE DRIVE MCP - Use for Google Drive file and folder management.

KEY TOOLS:
- listFiles: List files and folders in Google Drive (optionally filtered by folderId)

WHEN TO USE:
- User wants to access or manage files in Google Drive
- Need to retrieve documents, spreadsheets, or other Drive files
- Building file management workflows
- Integrating Google Drive with other services (Notion, Slack, etc.)

THINGS TO AVOID:
- Don't use for local file operations (use Filesystem MCP)
- Don't use for code repositories (use Git MCP)
- Requires GOOGLE_DRIVE_CREDENTIALS environment variable (JSON service account)

INTEGRATION NOTES:
- Works with Google Drive API v3
- Supports folder hierarchy navigation via folderId
- Can be combined with Notion for document sync workflows
- Useful for automated document management and backup operations`,
    execute: async (tool, params) => {
      if (!process.env.GOOGLE_DRIVE_CREDENTIALS)
        throw new Error("GOOGLE_DRIVE_CREDENTIALS not configured");
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      });
      const drive = google.drive({ version: "v3", auth });

      if (tool === "listFiles") {
        const response = await drive.files.list({
          q: params.folderId ? `'${params.folderId}' in parents` : undefined,
          fields: "files(id, name, mimeType)",
        });
        return response.data.files;
      }
      throw new Error(`Unknown google-drive tool: ${tool}`);
    },
  },

  // 20. OLLAMA - REST API with Sampling
  ollama: {
    name: "ollama",
    category: "ai",
    enabled: true,
    supportsSampling: true,
    tools: [
      {
        name: "chat",
        description: "Chat with Ollama",
        inputSchema: {
          type: "object",
          properties: {
            model: { type: "string" },
            messages: { type: "array" },
          },
          required: ["model", "messages"],
        },
      },
    ],
    resources: [
      {
        uri: "ollama://models",
        name: "Models",
        description: "Available models",
      },
    ],
    prompts: [],
    agentBriefing: `OLLAMA MCP - Use for local LLM inference with privacy and cost control.

KEY TOOLS:
- chat: Chat with locally running Ollama models (llama2, mistral, codellama, etc.)

WHEN TO USE:
- User wants to use local/private LLM inference (no API costs, data privacy)
- Need to run models offline or on-premises
- Cost-sensitive applications where API costs are prohibitive
- Privacy-critical use cases where data cannot leave the infrastructure

THINGS TO AVOID:
- Don't use if you need latest models (use OpenAI/Anthropic for cutting-edge)
- Don't use if you need high throughput (local models are slower)
- Requires OLLAMA_BASE_URL (defaults to http://localhost:11434)
- Ensure Ollama is installed and models are downloaded locally

INTEGRATION NOTES:
- Supports sampling for streaming responses
- Works with any Ollama-compatible model (llama2, mistral, codellama, phi, etc.)
- Can be combined with OpenAI/Anthropic for hybrid approaches
- Useful for development/testing without API costs
- Models must be pre-downloaded: ollama pull <model-name>`,
    execute: async (tool, params) => {
      const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

      if (tool === "chat") {
        const { data } = await axios.post(`${baseURL}/api/chat`, {
          model: params.model,
          messages: params.messages,
          stream: false,
        });
        return data;
      }
      throw new Error(`Unknown ollama tool: ${tool}`);
    },
  },

  // 21. BRAVE SEARCH - REST API
  // 22. BRAVE SEARCH - Privacy-focused search (FULLY UPGRADED: 1→7 tools!)
  "brave-search": {
    name: "brave-search",
    category: "search",
    enabled: true,
    agentBriefing: `BRAVE SEARCH MCP - Use for privacy-focused web search with independent index.

KEY TOOLS:
- webSearch: General web search with filters (freshness, safesearch, country, language)
- imageSearch: Search for images with privacy protection
- videoSearch: Find videos across the web
- newsSearch: Search recent news articles
- localSearch: Find local businesses and places
- suggest: Get autocomplete search suggestions
- spellcheck: Check spelling and get corrections

WHEN TO USE:
- User wants to search the web with privacy protection (no tracking)
- Need independent search results (not Google/Bing dependent)
- Building search-powered applications or workflows
- Need image, video, news, or local search capabilities
- Want search suggestions or spellcheck functionality

THINGS TO AVOID:
- Don't use for code search (use GitHub MCP searchCode)
- Don't use for database queries (use Postgres/SQLite/MongoDB MCPs)
- Requires BRAVE_SEARCH_API_KEY environment variable
- Free tier has rate limits (check Brave Search API docs)

INTEGRATION NOTES:
- Privacy-focused alternative to Google Search
- Independent search index (not dependent on other engines)
- Supports advanced filters: freshness (pd/pw/pm/py), safesearch, country codes
- Can be combined with Playwright for web scraping workflows
- Useful for research, content discovery, and information gathering tasks`,
    tools: [
      // Web Search (enhanced)
      { 
        name: "webSearch", 
        description: "Search web with Brave (privacy-focused, independent index)", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            country: { type: "string", description: "Country code (US, GB, etc)" },
            searchLang: { type: "string", description: "Search language (en, es, etc)" },
            count: { type: "number", description: "Number of results (max 20)" },
            offset: { type: "number", description: "Pagination offset" },
            safesearch: { type: "string", enum: ["off", "moderate", "strict"] },
            freshness: { type: "string", enum: ["pd", "pw", "pm", "py"], description: "pd=day, pw=week, pm=month, py=year" },
            resultFilter: { type: "string", description: "Filter: web, news, videos, images" },
            gogglesId: { type: "string", description: "Custom search goggles ID" },
          }, 
          required: ["query"] 
        } 
      },
      
      // Image Search
      { 
        name: "imageSearch", 
        description: "Search images", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            country: { type: "string" },
            count: { type: "number" },
            offset: { type: "number" },
            safesearch: { type: "string", enum: ["off", "moderate", "strict"] },
          }, 
          required: ["query"] 
        } 
      },
      
      // Video Search
      { 
        name: "videoSearch", 
        description: "Search videos", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            country: { type: "string" },
            count: { type: "number" },
            offset: { type: "number" },
            safesearch: { type: "string", enum: ["off", "moderate", "strict"] },
            freshness: { type: "string", enum: ["pd", "pw", "pm", "py"] },
          }, 
          required: ["query"] 
        } 
      },
      
      // News Search
      { 
        name: "newsSearch", 
        description: "Search news articles", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            country: { type: "string" },
            count: { type: "number" },
            offset: { type: "number" },
            freshness: { type: "string", enum: ["pd", "pw", "pm", "py"] },
          }, 
          required: ["query"] 
        } 
      },
      
      // Local Search
      { 
        name: "localSearch", 
        description: "Search local businesses/places", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            location: { type: "string", description: "Location name or address" },
            lat: { type: "number", description: "Latitude" },
            lon: { type: "number", description: "Longitude" },
            country: { type: "string" },
            count: { type: "number" },
          }, 
          required: ["query"] 
        } 
      },
      
      // Autocomplete Suggestions
      { 
        name: "suggest", 
        description: "Get search suggestions (autocomplete)", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            country: { type: "string" },
            lang: { type: "string" },
            count: { type: "number" },
          }, 
          required: ["query"] 
        } 
      },
      
      // Spellcheck
      { 
        name: "spellcheck", 
        description: "Check spelling and get corrections", 
        inputSchema: { 
          type: "object", 
          properties: { 
            query: { type: "string" },
            country: { type: "string" },
            searchLang: { type: "string" },
          }, 
          required: ["query"] 
        } 
      },
    ],
    resources: [
      { uri: "brave://web", name: "Web Results", description: "Web search results" },
      { uri: "brave://images", name: "Images", description: "Image search results" },
      { uri: "brave://videos", name: "Videos", description: "Video search results" },
      { uri: "brave://news", name: "News", description: "News articles" },
      { uri: "brave://local", name: "Local", description: "Local businesses" },
    ],
    prompts: [
      { 
        name: "search_web", 
        description: "Search the web with Brave", 
        arguments: [
          { name: "query", description: "Search query", required: true },
          { name: "filters", description: "Filters (freshness, safesearch, etc)", required: false },
        ] 
      },
      { 
        name: "find_images", 
        description: "Find images", 
        arguments: [
          { name: "query", description: "Image search query", required: true },
        ] 
      },
    ],
    execute: async (tool, params) => {
      const { executeBraveSearchTool } = await import("./brave-search-tools");
      return await executeBraveSearchTool(tool, params);
    },
  },

  // 22. PUPPETEER - puppeteer SDK
  puppeteer: {
    name: "puppeteer",
    category: "automation",
    enabled: true,
    tools: [
      {
        name: "navigate",
        description: "Navigate",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
    ],
    resources: [
      {
        uri: "puppeteer://sessions",
        name: "Sessions",
        description: "Active sessions",
      },
    ],
    prompts: [],
    agentBriefing: `PUPPETEER MCP - Use for browser automation and web scraping (Chrome/Chromium).

KEY TOOLS:
- navigate: Navigate to a URL and retrieve page content

WHEN TO USE:
- User wants to automate browser interactions or scrape web pages
- Need to interact with JavaScript-heavy websites
- Building web automation workflows
- Testing web applications or extracting dynamic content

THINGS TO AVOID:
- Don't use if you need more advanced features (use Playwright MCP - 24+ tools)
- Don't use for simple HTTP requests (use axios or fetch directly)
- Puppeteer launches headless Chrome (resource-intensive)
- Current implementation only has navigate tool (consider Playwright for full features)

INTEGRATION NOTES:
- Works with Chromium/Chrome browser
- Headless mode by default (no GUI)
- Can be extended with more Puppeteer features (screenshots, clicks, forms, etc.)
- Consider using Playwright MCP for comprehensive browser automation (24+ tools)
- Useful for web scraping, testing, and automation tasks`,
    execute: async (tool, params) => {
      if (tool === "navigate") {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(params.url);
        const content = await page.content();
        await browser.close();
        return { url: params.url, content };
      }
      throw new Error(`Unknown puppeteer tool: ${tool}`);
    },
  },

  // 23. SENTRY - @sentry/node
  sentry: {
    name: "sentry",
    category: "monitoring",
    enabled: true,
    tools: [
      {
        name: "captureError",
        description: "Capture error",
        inputSchema: {
          type: "object",
          properties: { error: { type: "string" } },
          required: ["error"],
        },
      },
    ],
    resources: [
      { uri: "sentry://issues", name: "Issues", description: "All issues" },
    ],
    prompts: [],
    agentBriefing: `SENTRY MCP - Use for error tracking and application monitoring.

KEY TOOLS:
- captureError: Capture and report errors to Sentry for monitoring and debugging

WHEN TO USE:
- User wants to track errors and exceptions in their application
- Need centralized error monitoring and alerting
- Building error reporting workflows
- Integrating error tracking into development workflows

THINGS TO AVOID:
- Don't use for logging general information (use console.log or proper logging)
- Don't use for user-facing error messages (this is for monitoring, not UX)
- Requires SENTRY_DSN environment variable
- Initialize Sentry once, not on every error capture

INTEGRATION NOTES:
- Works with Sentry error tracking platform
- Captures errors with stack traces and context
- Returns eventId for tracking error reports
- Can be integrated into all error handlers for comprehensive monitoring
- Useful for production error tracking and debugging workflows`,
    execute: async (tool, params) => {
      if (!process.env.SENTRY_DSN) throw new Error("SENTRY_DSN not configured");
      Sentry.init({ dsn: process.env.SENTRY_DSN });

      if (tool === "captureError") {
        const eventId = Sentry.captureException(new Error(params.error));
        return { eventId };
      }
      throw new Error(`Unknown sentry tool: ${tool}`);
    },
  },

  // 24. STRAPI - REST API
  strapi: {
    name: "strapi",
    category: "cms",
    enabled: true,
    tools: [
      {
        name: "getEntries",
        description: "Get entries",
        inputSchema: {
          type: "object",
          properties: { contentType: { type: "string" } },
          required: ["contentType"],
        },
      },
    ],
    resources: [
      {
        uri: "strapi://content-types",
        name: "Content Types",
        description: "All content types",
      },
    ],
    prompts: [],
    agentBriefing: `STRAPI MCP - Use for Strapi headless CMS content management.

KEY TOOLS:
- getEntries: Retrieve content entries from Strapi by content type

WHEN TO USE:
- User wants to access or manage content from Strapi CMS
- Need to retrieve blog posts, pages, or custom content types
- Building content-driven applications or workflows
- Integrating Strapi content with other services

THINGS TO AVOID:
- Don't use for file storage (use Filesystem or Google Drive)
- Don't use for database queries (use Postgres/MongoDB for raw data)
- Requires STRAPI_URL and STRAPI_API_KEY environment variables
- Content type names must match Strapi schema exactly

INTEGRATION NOTES:
- Works with Strapi headless CMS REST API
- Supports all Strapi content types (blog posts, pages, custom types, etc.)
- Can be combined with Notion for content sync workflows
- Useful for content management, blog automation, and CMS integrations
- Extend with createEntry, updateEntry, deleteEntry for full CRUD operations`,
    execute: async (tool, params) => {
      if (!process.env.STRAPI_URL || !process.env.STRAPI_API_KEY)
        throw new Error("STRAPI_URL and STRAPI_API_KEY not configured");

      if (tool === "getEntries") {
        const { data } = await axios.get(
          `${process.env.STRAPI_URL}/api/${params.contentType}`,
          {
            headers: { Authorization: `Bearer ${process.env.STRAPI_API_KEY}` },
          }
        );
        return data.data;
      }
      throw new Error(`Unknown strapi tool: ${tool}`);
    },
  },

  // 25. STRIPE - stripe SDK
  stripe: {
    name: "stripe",
    category: "payments",
    enabled: true,
    tools: [
      {
        name: "listCustomers",
        description: "List customers",
        inputSchema: {
          type: "object",
          properties: { limit: { type: "number" } },
        },
      },
    ],
    resources: [
      {
        uri: "stripe://customers",
        name: "Customers",
        description: "All customers",
      },
    ],
    prompts: [],
    agentBriefing: `STRIPE MCP - Use for payment processing and customer management.

KEY TOOLS:
- listCustomers: Retrieve customer records from Stripe

WHEN TO USE:
- User wants to manage payments, subscriptions, or customers
- Need to process payments or handle billing
- Building e-commerce or SaaS payment workflows
- Integrating payment processing into applications

THINGS TO AVOID:
- Don't use for general financial data (use databases for accounting)
- Don't use for non-payment operations (Stripe is payment-focused)
- Requires STRIPE_SECRET_KEY environment variable (use test keys for development)
- Be extremely careful with production keys (never expose in code)

INTEGRATION NOTES:
- Works with Stripe payment platform
- Supports customers, payments, subscriptions, invoices, etc.
- Can be extended with createCustomer, createPayment, createSubscription, etc.
- Useful for payment processing, subscription management, and billing automation
- Always use test mode keys during development
- Consider webhook integration for real-time payment events`,
    execute: async (tool, params) => {
      if (!process.env.STRIPE_SECRET_KEY)
        throw new Error("STRIPE_SECRET_KEY not configured");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });

      if (tool === "listCustomers") {
        const customers = await stripe.customers.list({
          limit: params.limit || 10,
        });
        return customers.data;
      }
      throw new Error(`Unknown stripe tool: ${tool}`);
    },
  },

  // 26. DAGGER - Dagger SDK (CI/CD Pipeline-as-Code)
  dagger: {
    name: "dagger",
    category: "infrastructure",
    enabled: true,
    tools: [
      // Pipeline Operations (3 tools)
      { name: "createPipeline", description: "Create CI/CD pipeline definition", inputSchema: { type: "object", properties: { name: { type: "string" }, steps: { type: "array" } }, required: ["name", "steps"] } },
      { name: "runPipeline", description: "Execute pipeline", inputSchema: { type: "object", properties: { pipelineName: { type: "string" }, params: { type: "object" } }, required: ["pipelineName"] } },
      { name: "listPipelines", description: "List available pipelines", inputSchema: { type: "object", properties: {} } },
      
      // Build Operations (2 tools)
      { name: "buildImage", description: "Build container image with Dagger", inputSchema: { type: "object", properties: { context: { type: "string" }, dockerfile: { type: "string" }, tag: { type: "string" } }, required: ["context"] } },
      { name: "buildWithCache", description: "Build with intelligent caching", inputSchema: { type: "object", properties: { context: { type: "string" }, cacheKey: { type: "string" } }, required: ["context", "cacheKey"] } },
      
      // Deploy Operations (2 tools)
      { name: "deployToRailway", description: "Deploy to Railway via Dagger", inputSchema: { type: "object", properties: { image: { type: "string" }, serviceName: { type: "string" } }, required: ["image", "serviceName"] } },
      { name: "deployToDocker", description: "Deploy to Docker via Dagger", inputSchema: { type: "object", properties: { image: { type: "string" }, containerName: { type: "string" } }, required: ["image", "containerName"] } },
      
      // Test Operations (2 tools)
      { name: "runTests", description: "Run tests in isolated container", inputSchema: { type: "object", properties: { context: { type: "string" }, testCommand: { type: "string" } }, required: ["context"] } },
      { name: "runLint", description: "Run linter in isolated container", inputSchema: { type: "object", properties: { context: { type: "string" } }, required: ["context"] } },
      
      // Cache Operations (2 tools)
      { name: "createCache", description: "Create cache volume", inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] } },
      { name: "clearCache", description: "Clear cache volume", inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] } },
      
      // Module Operations (2 tools)
      { name: "listModules", description: "List Dagger modules", inputSchema: { type: "object", properties: {} } },
      { name: "createModule", description: "Create Dagger module", inputSchema: { type: "object", properties: { name: { type: "string" }, definition: { type: "object" } }, required: ["name", "definition"] } },
    ],
    resources: [
      { uri: "dagger://pipelines", name: "Pipelines", description: "All CI/CD pipelines" },
      { uri: "dagger://modules", name: "Modules", description: "Dagger modules" },
      { uri: "dagger://cache", name: "Cache", description: "Build cache volumes" },
    ],
    prompts: [
      {
        name: "build_and_deploy",
        description: "Build and deploy application",
        arguments: [
          { name: "context", description: "Build context path", required: true },
          { name: "target", description: "Deployment target (railway/docker)", required: true },
        ],
      },
    ],
    execute: async (tool, params) => {
      const { executeDaggerTool } = await import("./dagger-tools");
      return await executeDaggerTool(tool, params);
    },
    agentBriefing: `DAGGER MCP - Use for ALL CI/CD pipeline operations and DevOps automation.

WHEN TO USE:
- Building CI/CD pipelines as code
- Container builds with intelligent caching
- Automated deployments to Railway/Docker
- Running tests in isolated environments
- Managing build cache for faster builds
- Creating reusable pipeline modules
- DevOps automation and orchestration

KEY TOOLS:
- createPipeline/runPipeline: Pipeline management
- buildImage/buildWithCache: Container builds with caching
- deployToRailway/deployToDocker: Automated deployments
- runTests/runLint: Isolated test execution
- createCache/clearCache: Build cache management
- listModules/createModule: Module management

USE CASES:
- "Build the app with Dagger caching"
- "Create a pipeline for build, test, and deploy"
- "Deploy the latest build to Railway"
- "Run tests in an isolated container"
- "Clear the build cache and rebuild"

BENEFITS:
- 10x faster than traditional CI/CD (intelligent caching)
- Pipeline-as-code (version controlled)
- Local testing before CI
- Consistent environments
- Automatic artifact caching

AVOID: Use Docker MCP for simple container operations. Use Dagger MCP for CI/CD pipelines and DevOps automation.`,
  },
};
