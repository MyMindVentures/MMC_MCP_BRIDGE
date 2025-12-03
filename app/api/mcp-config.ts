// MCP Servers Configuration - Consolidated
// All 23 MCP servers with Tools, Resources, Prompts, Sampling, GraphQL

import axios from 'axios';

// Types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: { type: string; properties: Record<string, any>; required?: string[] };
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
}

// GraphQL helper
async function gql(endpoint: string, query: string, vars: any, headers: Record<string, string>) {
  const res = await axios.post(endpoint, { query, variables: vars }, { headers });
  return res.data;
}

// MCP Servers Registry
export const MCP_SERVERS: Record<string, MCPServer> = {
  git: {
    name: 'git', category: 'development', enabled: true,
    tools: [
      { name: 'clone', description: 'Clone repository', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'commit', description: 'Commit changes', inputSchema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
      { name: 'push', description: 'Push to remote', inputSchema: { type: 'object', properties: {} } },
      { name: 'pull', description: 'Pull from remote', inputSchema: { type: 'object', properties: {} } },
      { name: 'branch', description: 'Manage branches', inputSchema: { type: 'object', properties: { action: { type: 'string' } } } }
    ],
    resources: [
      { uri: 'git://status', name: 'Git Status', description: 'Current status' },
      { uri: 'git://branches', name: 'Branches', description: 'All branches' }
    ],
    prompts: [{ name: 'commit_message', description: 'Help write commit messages', arguments: [{ name: 'changes', description: 'What changed', required: true }] }]
  },

  filesystem: {
    name: 'filesystem', category: 'development', enabled: true,
    tools: [
      { name: 'readFile', description: 'Read file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'writeFile', description: 'Write file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
      { name: 'listDir', description: 'List directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'deleteFile', description: 'Delete file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } }
    ],
    resources: [{ uri: 'file:///', name: 'Root', description: 'Filesystem root' }],
    prompts: [{ name: 'file_operations', description: 'Help with file ops', arguments: [{ name: 'operation', description: 'What to do', required: true }] }]
  },

  playwright: {
    name: 'playwright', category: 'automation', enabled: true,
    tools: [
      { name: 'navigate', description: 'Navigate to URL', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'screenshot', description: 'Take screenshot', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'scrape', description: 'Scrape content', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'interact', description: 'Interact with elements', inputSchema: { type: 'object', properties: { url: { type: 'string' }, actions: { type: 'array' } }, required: ['url', 'actions'] } }
    ],
    resources: [{ uri: 'playwright://browsers', name: 'Browsers', description: 'Available browsers' }],
    prompts: [{ name: 'web_automation', description: 'Help automate web tasks', arguments: [{ name: 'task', description: 'What to automate', required: true }] }]
  },

  n8n: {
    name: 'n8n', category: 'automation', enabled: !!process.env.N8N_API_KEY,
    tools: [
      { name: 'listWorkflows', description: 'List workflows', inputSchema: { type: 'object', properties: {} } },
      { name: 'executeWorkflow', description: 'Execute workflow', inputSchema: { type: 'object', properties: { workflowId: { type: 'string' } }, required: ['workflowId'] } }
    ],
    resources: [{ uri: 'n8n://workflows', name: 'Workflows', description: 'All workflows' }],
    prompts: [{ name: 'create_automation', description: 'Help create automation', arguments: [{ name: 'task', description: 'What to automate', required: true }] }],
    execute: async (tool, params) => {
      const res = await axios.post(`${process.env.N8N_BASE_URL}/api/v1/${tool}`, params, { headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY } });
      return res.data;
    }
  },

  mongodb: {
    name: 'mongodb', category: 'database', enabled: !!process.env.MONGODB_CONNECTION_STRING,
    tools: [
      { name: 'find', description: 'Find documents', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' } }, required: ['database', 'collection'] } },
      { name: 'insert', description: 'Insert document', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' }, document: { type: 'object' } }, required: ['database', 'collection', 'document'] } }
    ],
    resources: [{ uri: 'mongodb://databases', name: 'Databases', description: 'All databases' }],
    prompts: [{ name: 'query_builder', description: 'Help build queries', arguments: [{ name: 'description', description: 'What to query', required: true }] }]
  },

  linear: {
    name: 'linear', category: 'productivity', enabled: !!process.env.LINEAR_API_KEY,
    graphql: { endpoint: 'https://api.linear.app/graphql', headers: { Authorization: process.env.LINEAR_API_KEY || '' } },
    tools: [
      { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object', properties: {} } },
      { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object', properties: { teamId: { type: 'string' }, title: { type: 'string' } }, required: ['teamId', 'title'] } }
    ],
    resources: [{ uri: 'linear://issues', name: 'Issues', description: 'All issues' }],
    prompts: [{ name: 'create_task', description: 'Help create task', arguments: [{ name: 'description', description: 'Task description', required: true }] }],
    execute: async (tool, params) => {
      const queries: Record<string, string> = {
        listIssues: 'query { issues { nodes { id title } } }',
        createIssue: 'mutation($teamId: String!, $title: String!) { issueCreate(input: { teamId: $teamId, title: $title }) { issue { id } } }'
      };
      return gql('https://api.linear.app/graphql', queries[tool], params, { Authorization: process.env.LINEAR_API_KEY || '' });
    }
  },

  railway: {
    name: 'railway', category: 'infrastructure', enabled: !!process.env.RAILWAY_API_KEY,
    graphql: { endpoint: 'https://backboard.railway.app/graphql/v2', headers: { Authorization: `Bearer ${process.env.RAILWAY_API_KEY}` } },
    tools: [
      { name: 'listProjects', description: 'List projects', inputSchema: { type: 'object', properties: {} } },
      { name: 'getProject', description: 'Get project', inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] } }
    ],
    resources: [{ uri: 'railway://projects', name: 'Projects', description: 'All projects' }],
    execute: async (tool, params) => {
      const queries: Record<string, string> = {
        listProjects: 'query { projects { edges { node { id name } } } }',
        getProject: 'query($id: String!) { project(id: $id) { id name } }'
      };
      return gql('https://backboard.railway.app/graphql/v2', queries[tool], params, { Authorization: `Bearer ${process.env.RAILWAY_API_KEY}` });
    }
  },

  github: {
    name: 'github', category: 'development', enabled: !!process.env.GITHUB_TOKEN,
    graphql: { endpoint: 'https://api.github.com/graphql', headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } },
    tools: [
      { name: 'listRepos', description: 'List repos', inputSchema: { type: 'object', properties: { owner: { type: 'string' } } } },
      { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' } }, required: ['owner', 'repo', 'title'] } }
    ],
    resources: [{ uri: 'github://repos', name: 'Repositories', description: 'All repos' }]
  },

  openai: {
    name: 'openai', category: 'ai', enabled: !!process.env.OPENAI_API_KEY, supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with GPT', inputSchema: { type: 'object', properties: { messages: { type: 'array' } }, required: ['messages'] } },
      { name: 'completion', description: 'Text completion', inputSchema: { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'] } }
    ],
    resources: [{ uri: 'openai://models', name: 'Models', description: 'Available models' }]
  },

  anthropic: {
    name: 'anthropic', category: 'ai', enabled: !!process.env.ANTHROPIC_API_KEY, supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with Claude', inputSchema: { type: 'object', properties: { messages: { type: 'array' } }, required: ['messages'] } }
    ],
    resources: [{ uri: 'anthropic://models', name: 'Models', description: 'Claude models' }]
  },

  // Additional servers (minimal configs)
  postgres: { name: 'postgres', category: 'database', enabled: !!process.env.POSTGRES_CONNECTION_STRING, tools: [{ name: 'query', description: 'SQL query', inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] } }], resources: [{ uri: 'postgres://tables', name: 'Tables', description: 'All tables' }] },
  sqlite: { name: 'sqlite', category: 'database', enabled: !!process.env.SQLITE_DB_PATH, tools: [{ name: 'query', description: 'SQL query', inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] } }], resources: [{ uri: 'sqlite://tables', name: 'Tables', description: 'All tables' }] },
  notion: { name: 'notion', category: 'productivity', enabled: !!process.env.NOTION_API_KEY, tools: [{ name: 'queryDatabase', description: 'Query database', inputSchema: { type: 'object', properties: { databaseId: { type: 'string' } }, required: ['databaseId'] } }], resources: [{ uri: 'notion://databases', name: 'Databases', description: 'All databases' }] },
  slack: { name: 'slack', category: 'communication', enabled: !!process.env.SLACK_BOT_TOKEN, tools: [{ name: 'postMessage', description: 'Post message', inputSchema: { type: 'object', properties: { channel: { type: 'string' }, text: { type: 'string' } }, required: ['channel', 'text'] } }], resources: [{ uri: 'slack://channels', name: 'Channels', description: 'All channels' }] },
  airtable: { name: 'airtable', category: 'productivity', enabled: !!process.env.AIRTABLE_API_KEY, tools: [{ name: 'listRecords', description: 'List records', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' } }, required: ['baseId', 'tableId'] } }], resources: [{ uri: 'airtable://bases', name: 'Bases', description: 'All bases' }] },
  doppler: { name: 'doppler', category: 'security', enabled: !!process.env.DOPPLER_API_KEY, tools: [{ name: 'getSecrets', description: 'Get secrets', inputSchema: { type: 'object', properties: { project: { type: 'string' } }, required: ['project'] } }], resources: [{ uri: 'doppler://projects', name: 'Projects', description: 'All projects' }] },
  raindrop: { name: 'raindrop', category: 'productivity', enabled: !!process.env.RAINDROP_API_KEY, tools: [{ name: 'listBookmarks', description: 'List bookmarks', inputSchema: { type: 'object', properties: {} } }], resources: [{ uri: 'raindrop://collections', name: 'Collections', description: 'All collections' }] },
  postman: { name: 'postman', category: 'development', enabled: !!process.env.POSTMAN_API_KEY, tools: [{ name: 'listCollections', description: 'List collections', inputSchema: { type: 'object', properties: {} } }], resources: [{ uri: 'postman://collections', name: 'Collections', description: 'All collections' }] },
  googleDrive: { name: 'google-drive', category: 'storage', enabled: !!process.env.GOOGLE_DRIVE_CREDENTIALS, tools: [{ name: 'listFiles', description: 'List files', inputSchema: { type: 'object', properties: {} } }], resources: [{ uri: 'gdrive://files', name: 'Files', description: 'All files' }] },
  ollama: { name: 'ollama', category: 'ai', enabled: !!process.env.OLLAMA_BASE_URL, supportsSampling: true, tools: [{ name: 'chat', description: 'Chat with Ollama', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' } }, required: ['model', 'messages'] } }], resources: [{ uri: 'ollama://models', name: 'Models', description: 'Available models' }] },
  braveSearch: { name: 'brave-search', category: 'search', enabled: !!process.env.BRAVE_SEARCH_API_KEY, tools: [{ name: 'webSearch', description: 'Search web', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }], resources: [{ uri: 'brave://results', name: 'Results', description: 'Search results' }] },
  puppeteer: { name: 'puppeteer', category: 'automation', enabled: !!process.env.PUPPETEER_EXECUTABLE_PATH, tools: [{ name: 'navigate', description: 'Navigate', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } }], resources: [{ uri: 'puppeteer://sessions', name: 'Sessions', description: 'Active sessions' }] },
  sentry: { name: 'sentry', category: 'monitoring', enabled: !!process.env.SENTRY_DSN, tools: [{ name: 'captureError', description: 'Capture error', inputSchema: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } }], resources: [{ uri: 'sentry://issues', name: 'Issues', description: 'All issues' }] }
};

