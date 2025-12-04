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
import { executeN8NCommunityTool } from './n8n-community/proxy';

// Connection pools (singleton pattern)
let mongoClient: MongoClient | null = null;
let pgPool: Pool | null = null;
let sqliteDb: Database.Database | null = null;

// Helper for GraphQL
async function gql(endpoint: string, query: string, vars: any, headers: Record<string, string>) {
  const res = await axios.post(endpoint, { query, variables: vars }, { headers });
  return res.data;
}

export async function executeMCPTool(serverName: string, toolName: string, params: any): Promise<any> {
  switch (serverName) {
    case 'n8n-community': {
      // Use @leonardsellem/n8n-mcp-server community package
      const result = await executeN8NCommunityTool(toolName, params);
      return result.content || result;
    }

    case 'git': {
      const git = simpleGit(params.path || process.cwd());
      switch (toolName) {
        case 'clone': return await git.clone(params.url, params.path);
        case 'commit': 
          if (params.files?.length) await git.add(params.files);
          return await git.commit(params.message);
        case 'push': return await git.push(params.remote || 'origin', params.branch || 'main');
        case 'pull': return await git.pull(params.remote || 'origin', params.branch || 'main');
        case 'branch':
          if (params.action === 'list') return await git.branch();
          if (params.action === 'create') return await git.checkoutLocalBranch(params.name);
          if (params.action === 'delete') return await git.deleteLocalBranch(params.name);
          throw new Error('Invalid branch action');
        case 'status': return await git.status();
        case 'log': return await git.log({ maxCount: params.limit || 10 });
        default: throw new Error(`Unknown git tool: ${toolName}`);
      }
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

    case 'n8n': {
      if (!process.env.N8N_API_KEY) throw new Error('N8N_API_KEY not configured');
      const baseURL = process.env.N8N_BASE_URL || 'https://n8n.example.com';
      const headers = { 'X-N8N-API-KEY': process.env.N8N_API_KEY };
      
      switch (toolName) {
        // Workflow Management
        case 'listWorkflows':
          const { data: workflows } = await axios.get(`${baseURL}/api/v1/workflows`, { 
            headers, 
            params: { active: params.active, tags: params.tags } 
          });
          return workflows;
        
        case 'getWorkflow':
          const { data: wf } = await axios.get(`${baseURL}/api/v1/workflows/${params.workflowId}`, { headers });
          return wf;
        
        case 'createWorkflow':
          const { data: workflow } = await axios.post(`${baseURL}/api/v1/workflows`, {
            name: params.name,
            nodes: params.nodes,
            connections: params.connections || {},
            settings: params.settings || {},
            staticData: params.staticData || {},
            tags: params.tags || []
          }, { headers });
          return workflow;
        
        case 'updateWorkflow':
          const { data: updated } = await axios.patch(`${baseURL}/api/v1/workflows/${params.workflowId}`, {
            name: params.name,
            nodes: params.nodes,
            connections: params.connections,
            settings: params.settings,
            active: params.active
          }, { headers });
          return updated;
        
        case 'deleteWorkflow':
          await axios.delete(`${baseURL}/api/v1/workflows/${params.workflowId}`, { headers });
          return { success: true, workflowId: params.workflowId };
        
        case 'activateWorkflow':
          const { data: activated } = await axios.patch(`${baseURL}/api/v1/workflows/${params.workflowId}`, {
            active: true
          }, { headers });
          return activated;
        
        case 'deactivateWorkflow':
          const { data: deactivated } = await axios.patch(`${baseURL}/api/v1/workflows/${params.workflowId}`, {
            active: false
          }, { headers });
          return deactivated;
        
        // Workflow Execution
        case 'executeWorkflow':
          const { data: execution } = await axios.post(`${baseURL}/api/v1/workflows/${params.workflowId}/execute`, 
            params.data || {}, 
            { headers }
          );
          return execution;
        
        case 'getExecution':
          const { data: exec } = await axios.get(`${baseURL}/api/v1/executions/${params.executionId}`, { headers });
          return exec;
        
        case 'listExecutions':
          const { data: executions } = await axios.get(`${baseURL}/api/v1/executions`, {
            headers,
            params: {
              workflowId: params.workflowId,
              status: params.status,
              limit: params.limit || 20
            }
          });
          return executions;
        
        case 'deleteExecution':
          await axios.delete(`${baseURL}/api/v1/executions/${params.executionId}`, { headers });
          return { success: true, executionId: params.executionId };
        
        // Node Discovery (525+ nodes!)
        case 'listNodes':
          const { data: nodes } = await axios.get(`${baseURL}/api/v1/node-types`, { headers });
          return nodes;
        
        case 'getNodeInfo':
          const { data: nodeInfo } = await axios.get(`${baseURL}/api/v1/node-types/${params.nodeType}`, { headers });
          return nodeInfo;
        
        // Credentials Management
        case 'listCredentials':
          const { data: creds } = await axios.get(`${baseURL}/api/v1/credentials`, { headers });
          return creds;
        
        case 'createCredential':
          const { data: cred } = await axios.post(`${baseURL}/api/v1/credentials`, {
            name: params.name,
            type: params.type,
            data: params.data
          }, { headers });
          return cred;
        
        // Tags Management
        case 'listTags':
          const { data: tags } = await axios.get(`${baseURL}/api/v1/tags`, { headers });
          return tags;
        
        case 'createTag':
          const { data: tag } = await axios.post(`${baseURL}/api/v1/tags`, {
            name: params.name
          }, { headers });
          return tag;
        
        // Webhook Management
        case 'testWebhook':
          const { data: webhookTest } = await axios.post(`${baseURL}/webhook-test/${params.path}`, 
            params.data || {}, 
            { headers }
          );
          return webhookTest;
        
        // AI-Powered Workflow Building
        case 'buildWorkflowFromDescription':
          // Use AI to generate workflow from natural language
          if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY required for AI workflow building');
          const OpenAI = (await import('openai')).default;
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are an n8n workflow expert. Generate a valid n8n workflow JSON with nodes and connections based on the user's description. 
Available node types include: HTTP Request, Set, IF, Switch, Code, Webhook, Schedule Trigger, Email Send, Slack, Discord, GitHub, Linear, MongoDB, Postgres, etc.
Return ONLY valid JSON with this structure:
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...}
}`
              },
              {
                role: 'user',
                content: params.description
              }
            ],
            temperature: 0.3
          });
          
          const workflowJson = JSON.parse(completion.choices[0].message.content || '{}');
          
          // Create the workflow in n8n
          const { data: aiWorkflow } = await axios.post(`${baseURL}/api/v1/workflows`, workflowJson, { headers });
          return aiWorkflow;
        
        default: throw new Error(`Unknown n8n tool: ${toolName}`);
      }
    }

    case 'mongodb': {
      if (!process.env.MONGODB_CONNECTION_STRING) throw new Error('MONGODB_CONNECTION_STRING not configured');
      if (!mongoClient) {
        mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
        await mongoClient.connect();
      }
      const db = mongoClient.db(params.database);
      const collection = db.collection(params.collection);
      
      switch (toolName) {
        case 'find': return await collection.find(params.query || {}).limit(params.limit || 100).toArray();
        case 'insert': return await collection.insertOne(params.document);
        case 'update': return await collection.updateMany(params.query, { $set: params.update });
        case 'delete': return await collection.deleteMany(params.query);
        case 'aggregate': return await collection.aggregate(params.pipeline).toArray();
        default: throw new Error(`Unknown mongodb tool: ${toolName}`);
      }
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
      if (!process.env.RAILWAY_TOKEN) throw new Error('RAILWAY_TOKEN not configured');
      const endpoint = 'https://backboard.railway.com/graphql/v2';
      const headers = { Authorization: `Bearer ${process.env.RAILWAY_TOKEN}`, 'Content-Type': 'application/json' };
      
      const queries: Record<string, string> = {
        listProjects: 'query { projects { edges { node { id name } } } }',
        getProject: 'query($id: String!) { project(id: $id) { id name services { edges { node { id name } } } } }',
        listServices: 'query($projectId: String!) { project(id: $projectId) { services { edges { node { id name } } } } }',
        deployService: 'mutation($serviceId: String!) { serviceDeploy(serviceId: $serviceId) { id } }',
        getLogs: 'query($serviceId: String!, $limit: Int) { serviceLogs(serviceId: $serviceId, limit: $limit) { logs } }'
      };
      
      return await gql(endpoint, queries[toolName], params, headers);
    }

    case 'github': {
      if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      
      switch (toolName) {
        case 'listRepos':
          const { data: repos } = params.owner 
            ? await octokit.repos.listForUser({ username: params.owner, per_page: params.limit || 30 })
            : await octokit.repos.listForAuthenticatedUser({ per_page: params.limit || 30 });
          return repos;
        case 'createIssue':
          const { data: issue } = await octokit.issues.create({ owner: params.owner, repo: params.repo, title: params.title, body: params.body });
          return issue;
        case 'createPR':
          const { data: pr } = await octokit.pulls.create({ owner: params.owner, repo: params.repo, title: params.title, head: params.head, base: params.base });
          return pr;
        case 'searchCode':
          const { data: results } = await octokit.search.code({ q: params.query });
          return results;
        default: throw new Error(`Unknown github tool: ${toolName}`);
      }
    }

    case 'openai': {
      if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      switch (toolName) {
        case 'chat':
          const chatCompletion = await openai.chat.completions.create({
            model: params.model || 'gpt-4',
            messages: params.messages,
            temperature: params.temperature
          });
          return chatCompletion.choices[0].message;
        case 'completion':
          const completion = await openai.completions.create({
            model: params.model || 'gpt-3.5-turbo-instruct',
            prompt: params.prompt,
            max_tokens: params.max_tokens
          });
          return completion.choices[0].text;
        case 'embedding':
          const embedding = await openai.embeddings.create({
            model: params.model || 'text-embedding-3-small',
            input: params.input
          });
          return embedding.data[0].embedding;
        case 'image':
          const image = await openai.images.generate({
            prompt: params.prompt,
            size: params.size || '1024x1024'
          });
          return image.data[0];
        default: throw new Error(`Unknown openai tool: ${toolName}`);
      }
    }

    case 'anthropic': {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      switch (toolName) {
        case 'chat':
          const message = await anthropic.messages.create({
            model: params.model || 'claude-3-5-sonnet-20241022',
            max_tokens: params.max_tokens || 1024,
            messages: params.messages
          });
          return message.content[0];
        case 'completion':
          const completion = await anthropic.messages.create({
            model: params.model || 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [{ role: 'user', content: params.prompt }]
          });
          return completion.content[0];
        default: throw new Error(`Unknown anthropic tool: ${toolName}`);
      }
    }

    case 'postgres': {
      if (!process.env.POSTGRES_CONNECTION_STRING) throw new Error('POSTGRES_CONNECTION_STRING not configured');
      if (!pgPool) {
        pgPool = new Pool({ connectionString: process.env.POSTGRES_CONNECTION_STRING });
      }
      
      if (toolName === 'query') {
        const result = await pgPool.query(params.sql, params.params || []);
        return result.rows;
      }
      throw new Error(`Unknown postgres tool: ${toolName}`);
    }

    case 'sqlite': {
      if (!process.env.SQLITE_DB_PATH) throw new Error('SQLITE_DB_PATH not configured');
      if (!sqliteDb) {
        sqliteDb = new Database(process.env.SQLITE_DB_PATH);
      }
      
      if (toolName === 'query') {
        const stmt = sqliteDb.prepare(params.sql);
        return stmt.all();
      }
      throw new Error(`Unknown sqlite tool: ${toolName}`);
    }

    case 'notion': {
      if (!process.env.NOTION_API_KEY) throw new Error('NOTION_API_KEY not configured');
      const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });
      
      switch (toolName) {
        case 'queryDatabase':
          const response = await notion.databases.query({ database_id: params.databaseId, filter: params.filter });
          return response.results;
        case 'createPage':
          const page = await notion.pages.create({ parent: params.parent, properties: params.properties });
          return page;
        default: throw new Error(`Unknown notion tool: ${toolName}`);
      }
    }

    case 'slack': {
      if (!process.env.SLACK_BOT_TOKEN) throw new Error('SLACK_BOT_TOKEN not configured');
      const slack = new SlackClient(process.env.SLACK_BOT_TOKEN);
      
      switch (toolName) {
        case 'postMessage':
          const result = await slack.chat.postMessage({ channel: params.channel, text: params.text });
          return result;
        case 'listChannels':
          const channels = await slack.conversations.list();
          return channels.channels;
        default: throw new Error(`Unknown slack tool: ${toolName}`);
      }
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
      if (!process.env.DOPPLER_TOKEN) throw new Error('DOPPLER_TOKEN not configured');
      
      if (toolName === 'getSecrets') {
        const { data } = await axios.get(`https://api.doppler.com/v3/configs/config/secrets`, {
          headers: { Authorization: `Bearer ${process.env.DOPPLER_TOKEN}` },
          params: { project: params.project }
        });
        return data;
      }
      throw new Error(`Unknown doppler tool: ${toolName}`);
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
}

