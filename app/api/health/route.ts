import { NextResponse } from 'next/server';

const MCP_SERVERS = {
  n8n: { name: 'n8n', category: 'automation', enabled: !!process.env.N8N_API_KEY },
  railway: { name: 'railway', category: 'infrastructure', enabled: !!process.env.RAILWAY_API_KEY },
  mongodb: { name: 'mongodb', category: 'database', enabled: !!process.env.MONGODB_CONNECTION_STRING },
  postgres: { name: 'postgres', category: 'database', enabled: !!process.env.POSTGRES_CONNECTION_STRING },
  sqlite: { name: 'sqlite', category: 'database', enabled: !!process.env.SQLITE_DB_PATH },
  airtable: { name: 'airtable', category: 'productivity', enabled: !!process.env.AIRTABLE_API_KEY },
  doppler: { name: 'doppler', category: 'security', enabled: !!process.env.DOPPLER_API_KEY },
  linear: { name: 'linear', category: 'productivity', enabled: !!process.env.LINEAR_API_KEY },
  raindrop: { name: 'raindrop', category: 'productivity', enabled: !!process.env.RAINDROP_API_KEY },
  notion: { name: 'notion', category: 'productivity', enabled: !!process.env.NOTION_API_KEY },
  postman: { name: 'postman', category: 'development', enabled: !!process.env.POSTMAN_API_KEY },
  slack: { name: 'slack', category: 'communication', enabled: !!process.env.SLACK_BOT_TOKEN },
  googleDrive: { name: 'google-drive', category: 'storage', enabled: !!process.env.GOOGLE_DRIVE_CREDENTIALS },
  github: { name: 'github', category: 'development', enabled: !!process.env.GITHUB_TOKEN },
  git: { name: 'git', category: 'development', enabled: true },
  filesystem: { name: 'filesystem', category: 'development', enabled: true },
  openai: { name: 'openai', category: 'ai', enabled: !!process.env.OPENAI_API_KEY },
  anthropic: { name: 'anthropic', category: 'ai', enabled: !!process.env.ANTHROPIC_API_KEY },
  ollama: { name: 'ollama', category: 'ai', enabled: !!process.env.OLLAMA_BASE_URL },
  braveSearch: { name: 'brave-search', category: 'search', enabled: !!process.env.BRAVE_SEARCH_API_KEY },
  puppeteer: { name: 'puppeteer', category: 'automation', enabled: !!process.env.PUPPETEER_EXECUTABLE_PATH },
  playwright: { name: 'playwright', category: 'automation', enabled: true },
  sentry: { name: 'sentry', category: 'monitoring', enabled: !!process.env.SENTRY_DSN }
};

export async function GET() {
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

