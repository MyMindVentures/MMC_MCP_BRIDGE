// MCP Tool Executor - Centralized execution logic for all 25 servers
// This file contains the actual SDK execution logic

import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import { chromium } from 'playwright';
import { MongoClient } from 'mongodb';
import { LinearClient } from '@linear/sdk';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import { Client as NotionClient } from '@notionhq/client';
import { WebClient as SlackClient } from '@slack/web-api';
import Airtable from 'airtable';
import { google } from 'googleapis';
import puppeteer from 'puppeteer';
import * as Sentry from '@sentry/node';
import Stripe from 'stripe';
import axios from 'axios';
import { executeN8NCommunityTool } from './n8n/proxy';
import { executePostgresTool } from './postgres-tools';
import { executeSQLiteTool } from './sqlite-tools';
import { executeMongoDBTool } from './mongodb-tools';
import { executeNotionTool } from './notion-tools';
import { executeSlackTool } from './slack-tools';
import { Redis } from 'ioredis';

// Redis connection helper
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  try {
    return new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  } catch {
    return null;
  }
}

// Connection pools (singleton pattern)
let mongoClient: MongoClient | null = null;
let pgPool: Pool | null = null;
let sqliteDb: Database.Database | null = null;

// Helper for GraphQL
async function gql(endpoint: string, query: string, vars: any, headers: Record<string, string>) {
  const res = await axios.post(endpoint, { query, variables: vars }, { headers });
  return res.data;
}

// Log MCP tool execution
async function logToolExecution(serverName: string, toolName: string, params: any, result: any, error?: any) {
  const redisClient = getRedis();
  if (!redisClient) return;
  
  const log = {
    timestamp: new Date().toISOString(),
    server: serverName,
    tool: toolName,
    params: JSON.stringify(params),
    success: !error,
    error: error?.message,
    duration: Date.now() // Will be calculated by caller
  };
  
  try {
    await redisClient.lpush('audit:mcp-tools', JSON.stringify(log));
    await redisClient.ltrim('audit:mcp-tools', 0, 9999); // Keep last 10k executions
  } catch (err) {
    console.error('[MCP] Tool execution logging failed:', err);
  }
}

export async function executeMCPTool(serverName: string, toolName: string, params: any): Promise<any> {
  const startTime = Date.now();
  try {
    let result: any;
    
    switch (serverName) {
    case 'n8n': {
      // Use @leonardsellem/n8n-mcp-server (BEST IN THE WORLD! 🌍)
      result = await executeN8NCommunityTool(toolName, params);
      result = result.content || result;
      break;
    }

    case 'git': {
      // Use comprehensive Git tools (17+ tools!)
      const { executeGitTool } = await import('./git-tools');
      result = await executeGitTool(toolName, params);
      break;
    }

    case 'filesystem': {
      switch (toolName) {
        case 'readFile': return await fs.readFile(params.path, params.encoding || 'utf8');
        case 'writeFile': return await fs.writeFile(params.path, params.content);
        case 'listDir': return await fs.readdir(params.path, { withFileTypes: true });
        case 'deleteFile': return await fs.unlink(params.path);
        case 'createDir': return await fs.mkdir(params.path, { recursive: params.recursive !== false });
        case 'fileInfo': return await fs.stat(params.path);
        default: throw new Error(`Unknown filesystem tool: ${toolName}`);
      }
    }

    case 'playwright': {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      try {
        await page.goto(params.url);
        switch (toolName) {
          case 'navigate': return { url: page.url(), title: await page.title() };
          case 'screenshot': 
            const screenshot = await page.screenshot({ 
              fullPage: params.fullPage, 
              path: params.selector ? undefined : 'screenshot.png' 
            });
            return { screenshot: screenshot.toString('base64') };
          case 'scrape': 
            const content = params.selector 
              ? await page.locator(params.selector).textContent()
              : await page.content();
            return { content };
          case 'click':
            await page.click(params.selector);
            return { success: true };
          case 'interact':
            for (const action of params.actions) {
              if (action.type === 'click') await page.click(action.selector);
              if (action.type === 'fill') await page.fill(action.selector, action.value);
              if (action.type === 'select') await page.selectOption(action.selector, action.value);
            }
            return { success: true };
          default: throw new Error(`Unknown playwright tool: ${toolName}`);
        }
      } finally {
        await browser.close();
      }
    }


    case 'mongodb': {
      if (!process.env.MONGODB_CONNECTION_STRING) throw new Error('MONGODB_CONNECTION_STRING not configured');
      if (!mongoClient) {
        mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
        await mongoClient.connect();
      }
      
      // Use new comprehensive MongoDB tools (18+ tools!)
      return await executeMongoDBTool(mongoClient, toolName, params);
    }

    case 'linear': {
      if (!process.env.LINEAR_API_KEY) throw new Error('LINEAR_API_KEY not configured');
      const client = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
      
      switch (toolName) {
        case 'listIssues':
          const issues = await client.issues(params.filter);
          return await issues.nodes;
        case 'createIssue':
          const issue = await client.createIssue({ teamId: params.teamId, title: params.title, description: params.description });
          return issue;
        case 'updateIssue':
          const updated = await client.updateIssue(params.issueId, params.data);
          return updated;
        case 'searchIssues':
          const results = await client.searchIssues(params.query);
          return results;
        default: throw new Error(`Unknown linear tool: ${toolName}`);
      }
    }

    case 'railway': {
      // Use comprehensive Railway tools (22+ tools!)
      const { executeRailwayTool } = await import('./railway-tools');
      return await executeRailwayTool(toolName, params);
    }

    case 'github': {
      // Use comprehensive GitHub tools (35+ tools!)
      const { executeGitHubTool } = await import('./github-tools');
      result = await executeGitHubTool(toolName, params);
      break;
    }

    case 'openai': {
      // Use comprehensive OpenAI tools (36+ tools!)
      const { executeOpenAITool } = await import('./openai-tools');
      result = await executeOpenAITool(toolName, params);
      break;
    }

    case 'anthropic': {
      // Use comprehensive Anthropic tools (14+ tools!)
      const { executeAnthropicTool } = await import('./anthropic-tools');
      result = await executeAnthropicTool(toolName, params);
      break;
    }

    case 'postgres': {
      if (!process.env.POSTGRES_CONNECTION_STRING) throw new Error('POSTGRES_CONNECTION_STRING not configured');
      if (!pgPool) {
        pgPool = new Pool({ connectionString: process.env.POSTGRES_CONNECTION_STRING });
      }
      
      // Use new comprehensive Postgres tools (25+ tools!)
      return await executePostgresTool(pgPool, toolName, params);
    }

    case 'sqlite': {
      if (!process.env.SQLITE_DB_PATH) throw new Error('SQLITE_DB_PATH not configured');
      if (!sqliteDb) {
        sqliteDb = new Database(process.env.SQLITE_DB_PATH);
      }
      
      // Use new comprehensive SQLite tools (22+ tools!)
      return await executeSQLiteTool(sqliteDb, toolName, params);
    }

    case 'notion': {
      if (!process.env.NOTION_API_KEY) throw new Error('NOTION_API_KEY not configured');
      const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });
      
      // Use new comprehensive Notion tools (25+ tools!)
      return await executeNotionTool(notion, toolName, params);
    }

    case 'slack': {
      if (!process.env.SLACK_BOT_TOKEN) throw new Error('SLACK_BOT_TOKEN not configured');
      const slack = new SlackClient(process.env.SLACK_BOT_TOKEN);
      
      // Use new comprehensive Slack tools (30+ tools!)
      return await executeSlackTool(slack, toolName, params);
    }

    case 'airtable': {
      if (!process.env.AIRTABLE_API_KEY) throw new Error('AIRTABLE_API_KEY not configured');
      Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
      const base = Airtable.base(params.baseId);
      
      if (toolName === 'listRecords') {
        const records: any[] = [];
        await base(params.tableId).select().eachPage((pageRecords, fetchNextPage) => {
          records.push(...pageRecords);
          fetchNextPage();
        });
        return records;
      }
      throw new Error(`Unknown airtable tool: ${toolName}`);
    }

    case 'doppler': {
      // Use comprehensive Doppler tools (38+ tools!)
      const { executeDopplerTool } = await import('./doppler-tools');
      return await executeDopplerTool(toolName, params);
    }

    case 'raindrop': {
      if (!process.env.RAINDROP_TOKEN) throw new Error('RAINDROP_TOKEN not configured');
      
      if (toolName === 'listBookmarks') {
        const { data } = await axios.get('https://api.raindrop.io/rest/v1/raindrops/0', {
          headers: { Authorization: `Bearer ${process.env.RAINDROP_TOKEN}` }
        });
        return data.items;
      }
      throw new Error(`Unknown raindrop tool: ${toolName}`);
    }

    case 'postman': {
      if (!process.env.POSTMAN_API_KEY) throw new Error('POSTMAN_API_KEY not configured');
      
      if (toolName === 'listCollections') {
        const { data } = await axios.get('https://api.getpostman.com/collections', {
          headers: { 'X-Api-Key': process.env.POSTMAN_API_KEY }
        });
        return data.collections;
      }
      throw new Error(`Unknown postman tool: ${toolName}`);
    }

    case 'google-drive': {
      if (!process.env.GOOGLE_DRIVE_CREDENTIALS) throw new Error('GOOGLE_DRIVE_CREDENTIALS not configured');
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });
      const drive = google.drive({ version: 'v3', auth });
      
      if (toolName === 'listFiles') {
        const response = await drive.files.list({
          q: params.folderId ? `'${params.folderId}' in parents` : undefined,
          fields: 'files(id, name, mimeType)'
        });
        return response.data.files;
      }
      throw new Error(`Unknown google-drive tool: ${toolName}`);
    }

    case 'ollama': {
      const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      
      if (toolName === 'chat') {
        const { data } = await axios.post(`${baseURL}/api/chat`, {
          model: params.model,
          messages: params.messages,
          stream: false
        });
        return data;
      }
      throw new Error(`Unknown ollama tool: ${toolName}`);
    }

    case 'brave-search': {
      if (!process.env.BRAVE_SEARCH_API_KEY) throw new Error('BRAVE_SEARCH_API_KEY not configured');
      
      if (toolName === 'webSearch') {
        const { data } = await axios.get('https://api.search.brave.com/res/v1/web/search', {
          headers: { 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY },
          params: { q: params.query }
        });
        return data;
      }
      throw new Error(`Unknown brave-search tool: ${toolName}`);
    }

    case 'puppeteer': {
      if (toolName === 'navigate') {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(params.url);
        const content = await page.content();
        await browser.close();
        return { url: params.url, content };
      }
      throw new Error(`Unknown puppeteer tool: ${toolName}`);
    }

    case 'sentry': {
      if (!process.env.SENTRY_DSN) throw new Error('SENTRY_DSN not configured');
      Sentry.init({ dsn: process.env.SENTRY_DSN });
      
      if (toolName === 'captureError') {
        const eventId = Sentry.captureException(new Error(params.error));
        return { eventId };
      }
      throw new Error(`Unknown sentry tool: ${toolName}`);
    }

    case 'strapi': {
      if (!process.env.STRAPI_URL || !process.env.STRAPI_API_KEY) throw new Error('STRAPI_URL and STRAPI_API_KEY not configured');
      
      if (toolName === 'getEntries') {
        const { data } = await axios.get(`${process.env.STRAPI_URL}/api/${params.contentType}`, {
          headers: { Authorization: `Bearer ${process.env.STRAPI_API_KEY}` }
        });
        return data.data;
      }
      throw new Error(`Unknown strapi tool: ${toolName}`);
    }

    case 'stripe': {
      if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
      
      if (toolName === 'listCustomers') {
        const customers = await stripe.customers.list({ limit: params.limit || 10 });
        return customers.data;
      }
      throw new Error(`Unknown stripe tool: ${toolName}`);
    }

    default:
      throw new Error(`Unknown server: ${serverName}`);
    }
    
    // Log successful execution
    const duration = Date.now() - startTime;
    await logToolExecution(serverName, toolName, params, result, undefined);
    return result;
  } catch (error: any) {
    // Log failed execution
    const duration = Date.now() - startTime;
    await logToolExecution(serverName, toolName, params, null, error);
    throw error;
  }
}

