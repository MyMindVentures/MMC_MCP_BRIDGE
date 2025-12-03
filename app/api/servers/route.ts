import { NextResponse } from 'next/server';

const MCP_SERVERS = {
  n8n: {
    name: 'n8n',
    category: 'automation',
    enabled: !!process.env.N8N_API_KEY,
    tools: ['listWorkflows', 'executeWorkflow', 'createWorkflow']
  },
  railway: {
    name: 'railway',
    category: 'infrastructure',
    enabled: !!process.env.RAILWAY_API_KEY,
    tools: ['deployProject', 'getServices', 'getLogs']
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

export async function GET() {
  const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
  
  return NextResponse.json({
    servers: enabledServers.map(s => ({
      name: s.name,
      category: s.category,
      tools: s.tools
    }))
  });
}

