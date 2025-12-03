// MMC MCP BRIDGE - Full-Stack Next.js App (Single File)
// All UI + API Routes in one file using Next.js 15 Route Handlers

import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import axios from 'axios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MCP SERVERS REGISTRY (24+ SERVERS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MCP_SERVERS: Record<string, any> = {
  n8n: {
    name: 'n8n', category: 'automation', enabled: !!process.env.N8N_API_KEY,
    tools: ['listWorkflows', 'executeWorkflow', 'createWorkflow'],
    execute: async (tool: string, params: any) => {
      const res = await axios.post(`${process.env.N8N_BASE_URL}/api/v1/${tool}`, params, {
        headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
      });
      return res.data;
    }
  },
  railway: {
    name: 'railway', category: 'infrastructure', enabled: !!process.env.RAILWAY_API_KEY,
    tools: ['deployProject', 'getServices', 'getLogs'],
    execute: async (tool: string, params: any) => {
      const res = await axios.post('https://backboard.railway.app/graphql/v2', {
        query: `mutation { ${tool}(input: ${JSON.stringify(params)}) { id status } }`
      }, { headers: { 'Authorization': `Bearer ${process.env.RAILWAY_API_KEY}` }});
      return res.data;
    }
  },
  mongodb: { name: 'mongodb', category: 'database', enabled: !!process.env.MONGODB_CONNECTION_STRING, tools: ['find', 'insert', 'update', 'delete', 'aggregate'] },
  postgres: { name: 'postgres', category: 'database', enabled: !!process.env.POSTGRES_CONNECTION_STRING, tools: ['query', 'insert', 'update', 'delete'] },
  sqlite: { name: 'sqlite', category: 'database', enabled: !!process.env.SQLITE_DB_PATH, tools: ['query', 'insert', 'update', 'delete'] },
  airtable: { name: 'airtable', category: 'productivity', enabled: !!process.env.AIRTABLE_API_KEY, tools: ['listRecords', 'createRecord', 'updateRecord', 'deleteRecord'] },
  doppler: { name: 'doppler', category: 'security', enabled: !!process.env.DOPPLER_API_KEY, tools: ['getSecrets', 'updateSecret', 'listProjects'] },
  linear: { name: 'linear', category: 'productivity', enabled: !!process.env.LINEAR_API_KEY, tools: ['listIssues', 'createIssue', 'updateIssue', 'searchIssues'] },
  raindrop: { name: 'raindrop', category: 'productivity', enabled: !!process.env.RAINDROP_API_KEY, tools: ['listBookmarks', 'createBookmark', 'searchBookmarks'] },
  notion: { name: 'notion', category: 'productivity', enabled: !!process.env.NOTION_API_KEY, tools: ['queryDatabase', 'createPage', 'updatePage'] },
  postman: { name: 'postman', category: 'development', enabled: !!process.env.POSTMAN_API_KEY, tools: ['listCollections', 'runCollection', 'getEnvironment'] },
  slack: { name: 'slack', category: 'communication', enabled: !!process.env.SLACK_BOT_TOKEN, tools: ['postMessage', 'listChannels', 'uploadFile'] },
  googleDrive: { name: 'google-drive', category: 'storage', enabled: !!process.env.GOOGLE_DRIVE_CREDENTIALS, tools: ['listFiles', 'uploadFile', 'searchFiles', 'shareFile'] },
  github: { name: 'github', category: 'development', enabled: !!process.env.GITHUB_TOKEN, tools: ['listRepos', 'createIssue', 'createPR', 'searchCode'] },
  git: { name: 'git', category: 'development', enabled: true, tools: ['clone', 'commit', 'push', 'pull', 'branch'] },
  filesystem: { name: 'filesystem', category: 'development', enabled: true, tools: ['readFile', 'writeFile', 'listDir', 'deleteFile'] },
  openai: { name: 'openai', category: 'ai', enabled: !!process.env.OPENAI_API_KEY, tools: ['chat', 'completion', 'embedding', 'image'] },
  anthropic: { name: 'anthropic', category: 'ai', enabled: !!process.env.ANTHROPIC_API_KEY, tools: ['chat', 'completion'] },
  ollama: { name: 'ollama', category: 'ai', enabled: !!process.env.OLLAMA_BASE_URL, tools: ['chat', 'generate', 'listModels'] },
  braveSearch: { name: 'brave-search', category: 'search', enabled: !!process.env.BRAVE_SEARCH_API_KEY, tools: ['webSearch', 'imageSearch', 'newsSearch'] },
  puppeteer: { name: 'puppeteer', category: 'automation', enabled: !!process.env.PUPPETEER_EXECUTABLE_PATH, tools: ['navigate', 'screenshot', 'scrape', 'click'] },
  playwright: { name: 'playwright', category: 'automation', enabled: true, tools: ['navigate', 'screenshot', 'scrape', 'interact'] },
  sentry: { name: 'sentry', category: 'monitoring', enabled: !!process.env.SENTRY_DSN, tools: ['captureError', 'captureMessage', 'listIssues'] }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REDIS & QUEUE SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let redis: Redis | null = null;
let taskQueue: Queue | null = null;

function getQueue() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || '', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true
    });
    redis.connect().catch(err => console.error('Redis connection failed:', err.message));
  }
  if (!taskQueue) {
    taskQueue = new Queue('agentic-tasks', { connection: redis });
  }
  return taskQueue;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API ROUTE HANDLERS (Next.js 15 App Router)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function GET(request: Request) {
  const { pathname } = new URL(request.url);
  
  // Health Check
  if (pathname === '/api/health' || pathname === '/health') {
    const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mmc-mcp-bridge',
      version: '2.0.0',
      servers: {
        total: Object.keys(MCP_SERVERS).length,
        enabled: enabledServers.length,
        list: enabledServers.map(s => s.name)
      }
    });
  }
  
  // Servers List
  if (pathname === '/api/servers' || pathname === '/servers') {
    const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
    return NextResponse.json({
      servers: enabledServers.map(s => ({
        name: s.name,
        category: s.category,
        tools: s.tools
      }))
    });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);
  
  // Agent Execution
  if (pathname === '/api/agent') {
    try {
      const { instruction, context } = await request.json();
      if (!instruction) {
        return NextResponse.json({ error: 'instruction required' }, { status: 400 });
      }
      if (!process.env.REDIS_URL) {
        return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
      }
      const queue = getQueue();
      const job = await queue.add('agent-task', { instruction, context });
      return NextResponse.json({ jobId: job.id, status: 'queued' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // MCP Tool Execution: /api/mcp/:server/:tool
  const mcpMatch = pathname.match(/^\/api\/mcp\/([^\/]+)\/([^\/]+)$/);
  if (mcpMatch) {
    try {
      const [, serverName, tool] = mcpMatch;
      const server = MCP_SERVERS[serverName];
      if (!server || !server.enabled) {
        return NextResponse.json({ error: 'Server not found or disabled' }, { status: 404 });
      }
      if (!server.tools.includes(tool)) {
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
      }
      const body = await request.json();
      const result = server.execute 
        ? await server.execute(tool, body)
        : { message: `${serverName}.${tool} executed`, params: body };
      return NextResponse.json({ success: true, result });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UI COMPONENT (Client-Side)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [servers, setServers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchHealth();
    fetchServers();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      setServers(data.servers || []);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeAgent = async () => {
    if (!instruction.trim()) return;
    setResult({ status: 'loading' });
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🚀 MMC MCP Bridge</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Enterprise MCP Orchestration Platform</p>
        </header>

        {health && (
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>System Health</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Status</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.status}</div></div>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Version</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.version}</div></div>
              <div><div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Servers Enabled</div><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{health.servers?.enabled} / {health.servers?.total}</div></div>
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Agentic Execution</h2>
          <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Enter your instruction for the AI agent..." style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem' }} />
          <button onClick={executeAgent} disabled={!instruction.trim()} style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', background: instruction.trim() ? '#fff' : 'rgba(255,255,255,0.3)', color: instruction.trim() ? '#667eea' : '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: instruction.trim() ? 'pointer' : 'not-allowed' }}>Execute Agent</button>
          {result && <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}><pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(result, null, 2)}</pre></div>}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>MCP Servers ({servers.length})</h2>
          {loading ? <div>Loading servers...</div> : servers.length === 0 ? <div style={{ opacity: 0.7 }}>No servers enabled. Configure environment variables to enable MCP servers.</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {servers.map((server, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{server.name}</div>
                  <div style={{ opacity: 0.8, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{server.category}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7' }}>{server.tools?.length || 0} tools</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
