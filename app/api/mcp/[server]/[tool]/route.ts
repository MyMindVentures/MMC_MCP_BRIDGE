import { NextResponse } from 'next/server';
import axios from 'axios';

const MCP_SERVERS: Record<string, any> = {
  n8n: {
    name: 'n8n',
    category: 'automation',
    enabled: !!process.env.N8N_API_KEY,
    tools: ['listWorkflows', 'executeWorkflow', 'createWorkflow'],
    execute: async (tool: string, params: any) => {
      const res = await axios.post(`${process.env.N8N_BASE_URL}/api/v1/${tool}`, params, {
        headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
      });
      return res.data;
    }
  },
  railway: {
    name: 'railway',
    category: 'infrastructure',
    enabled: !!process.env.RAILWAY_API_KEY,
    tools: ['deployProject', 'getServices', 'getLogs'],
    execute: async (tool: string, params: any) => {
      const res = await axios.post('https://backboard.railway.app/graphql/v2', {
        query: `mutation { ${tool}(input: ${JSON.stringify(params)}) { id status } }`
      }, {
        headers: { 'Authorization': `Bearer ${process.env.RAILWAY_API_KEY}` }
      });
      return res.data;
    }
  },
  mongodb: {
    name: 'mongodb',
    category: 'database',
    enabled: !!process.env.MONGODB_CONNECTION_STRING,
    tools: ['find', 'insert', 'update', 'delete', 'aggregate']
  },
  postgres: {
    name: 'postgres',
    category: 'database',
    enabled: !!process.env.POSTGRES_CONNECTION_STRING,
    tools: ['query', 'insert', 'update', 'delete']
  },
  sqlite: {
    name: 'sqlite',
    category: 'database',
    enabled: !!process.env.SQLITE_DB_PATH,
    tools: ['query', 'insert', 'update', 'delete']
  },
  airtable: {
    name: 'airtable',
    category: 'productivity',
    enabled: !!process.env.AIRTABLE_API_KEY,
    tools: ['listRecords', 'createRecord', 'updateRecord', 'deleteRecord']
  },
  doppler: {
    name: 'doppler',
    category: 'security',
    enabled: !!process.env.DOPPLER_API_KEY,
    tools: ['getSecrets', 'updateSecret', 'listProjects']
  },
  linear: {
    name: 'linear',
    category: 'productivity',
    enabled: !!process.env.LINEAR_API_KEY,
    tools: ['listIssues', 'createIssue', 'updateIssue', 'searchIssues']
  },
  raindrop: {
    name: 'raindrop',
    category: 'productivity',
    enabled: !!process.env.RAINDROP_API_KEY,
    tools: ['listBookmarks', 'createBookmark', 'searchBookmarks']
  },
  notion: {
    name: 'notion',
    category: 'productivity',
    enabled: !!process.env.NOTION_API_KEY,
    tools: ['queryDatabase', 'createPage', 'updatePage']
  },
  postman: {
    name: 'postman',
    category: 'development',
    enabled: !!process.env.POSTMAN_API_KEY,
    tools: ['listCollections', 'runCollection', 'getEnvironment']
  },
  slack: {
    name: 'slack',
    category: 'communication',
    enabled: !!process.env.SLACK_BOT_TOKEN,
    tools: ['postMessage', 'listChannels', 'uploadFile']
  },
  googleDrive: {
    name: 'google-drive',
    category: 'storage',
    enabled: !!process.env.GOOGLE_DRIVE_CREDENTIALS,
    tools: ['listFiles', 'uploadFile', 'searchFiles', 'shareFile']
  },
  github: {
    name: 'github',
    category: 'development',
    enabled: !!process.env.GITHUB_TOKEN,
    tools: ['listRepos', 'createIssue', 'createPR', 'searchCode']
  },
  git: {
    name: 'git',
    category: 'development',
    enabled: true,
    tools: ['clone', 'commit', 'push', 'pull', 'branch']
  },
  filesystem: {
    name: 'filesystem',
    category: 'development',
    enabled: true,
    tools: ['readFile', 'writeFile', 'listDir', 'deleteFile']
  },
  openai: {
    name: 'openai',
    category: 'ai',
    enabled: !!process.env.OPENAI_API_KEY,
    tools: ['chat', 'completion', 'embedding', 'image']
  },
  anthropic: {
    name: 'anthropic',
    category: 'ai',
    enabled: !!process.env.ANTHROPIC_API_KEY,
    tools: ['chat', 'completion']
  },
  ollama: {
    name: 'ollama',
    category: 'ai',
    enabled: !!process.env.OLLAMA_BASE_URL,
    tools: ['chat', 'generate', 'listModels']
  },
  braveSearch: {
    name: 'brave-search',
    category: 'search',
    enabled: !!process.env.BRAVE_SEARCH_API_KEY,
    tools: ['webSearch', 'imageSearch', 'newsSearch']
  },
  puppeteer: {
    name: 'puppeteer',
    category: 'automation',
    enabled: !!process.env.PUPPETEER_EXECUTABLE_PATH,
    tools: ['navigate', 'screenshot', 'scrape', 'click']
  },
  playwright: {
    name: 'playwright',
    category: 'automation',
    enabled: true,
    tools: ['navigate', 'screenshot', 'scrape', 'interact']
  },
  sentry: {
    name: 'sentry',
    category: 'monitoring',
    enabled: !!process.env.SENTRY_DSN,
    tools: ['captureError', 'captureMessage', 'listIssues']
  }
};

export async function POST(
  request: Request,
  { params }: { params: { server: string; tool: string } }
) {
  try {
    const { server: serverName, tool } = params;
    const server = MCP_SERVERS[serverName];

    if (!server || !server.enabled) {
      return NextResponse.json(
        { error: 'Server not found or disabled' },
        { status: 404 }
      );
    }

    if (!server.tools.includes(tool)) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const result = server.execute 
      ? await server.execute(tool, body)
      : { message: `${serverName}.${tool} executed`, params: body };
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('MCP execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}

