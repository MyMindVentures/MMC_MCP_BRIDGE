// MCP Servers Configuration - ALL 24 SERVERS ALWAYS ENABLED
// Tools + Resources + Prompts + Sampling + GraphQL

import axios from 'axios';

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

async function gql(endpoint: string, query: string, vars: any, headers: Record<string, string>) {
  const res = await axios.post(endpoint, { query, variables: vars }, { headers });
  return res.data;
}

// ALL 24 MCP SERVERS - ALWAYS ENABLED
export const MCP_SERVERS: Record<string, MCPServer> = {
  // 1. GIT
  git: {
    name: 'git', category: 'development', enabled: true,
    tools: [
      { name: 'clone', description: 'Clone repository', inputSchema: { type: 'object', properties: { url: { type: 'string' }, path: { type: 'string' } }, required: ['url'] } },
      { name: 'commit', description: 'Commit changes', inputSchema: { type: 'object', properties: { message: { type: 'string' }, files: { type: 'array' } }, required: ['message'] } },
      { name: 'push', description: 'Push to remote', inputSchema: { type: 'object', properties: { remote: { type: 'string' }, branch: { type: 'string' } } } },
      { name: 'pull', description: 'Pull from remote', inputSchema: { type: 'object', properties: { remote: { type: 'string' }, branch: { type: 'string' } } } },
      { name: 'branch', description: 'Manage branches', inputSchema: { type: 'object', properties: { action: { type: 'string' }, name: { type: 'string' } } } },
      { name: 'status', description: 'Get git status', inputSchema: { type: 'object', properties: {} } },
      { name: 'log', description: 'Get commit log', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } }
    ],
    resources: [
      { uri: 'git://status', name: 'Git Status', description: 'Current git status' },
      { uri: 'git://branches', name: 'Branches', description: 'All git branches' },
      { uri: 'git://log', name: 'Commit Log', description: 'Recent commits' }
    ],
    prompts: [{ name: 'commit_message', description: 'Help write commit messages', arguments: [{ name: 'changes', description: 'What changed', required: true }] }]
  },

  // 2. FILESYSTEM
  filesystem: {
    name: 'filesystem', category: 'development', enabled: true,
    tools: [
      { name: 'readFile', description: 'Read file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'writeFile', description: 'Write file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
      { name: 'listDir', description: 'List directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'deleteFile', description: 'Delete file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'createDir', description: 'Create directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'fileInfo', description: 'Get file info', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } }
    ],
    resources: [{ uri: 'file:///', name: 'Root Directory', description: 'Filesystem root access' }],
    prompts: [{ name: 'file_operations', description: 'Help with file operations', arguments: [{ name: 'operation', description: 'What to do', required: true }] }]
  },

  // 3. PLAYWRIGHT
  playwright: {
    name: 'playwright', category: 'automation', enabled: true,
    tools: [
      { name: 'navigate', description: 'Navigate to URL', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'screenshot', description: 'Take screenshot', inputSchema: { type: 'object', properties: { url: { type: 'string' }, selector: { type: 'string' } }, required: ['url'] } },
      { name: 'scrape', description: 'Scrape content', inputSchema: { type: 'object', properties: { url: { type: 'string' }, selector: { type: 'string' } }, required: ['url'] } },
      { name: 'interact', description: 'Interact with elements', inputSchema: { type: 'object', properties: { url: { type: 'string' }, actions: { type: 'array' } }, required: ['url', 'actions'] } },
      { name: 'click', description: 'Click element', inputSchema: { type: 'object', properties: { url: { type: 'string' }, selector: { type: 'string' } }, required: ['url', 'selector'] } }
    ],
    resources: [{ uri: 'playwright://browsers', name: 'Browsers', description: 'Available browsers' }],
    prompts: [{ name: 'web_automation', description: 'Help automate web tasks', arguments: [{ name: 'task', description: 'What to automate', required: true }] }]
  },

  // 4. N8N
  n8n: {
    name: 'n8n', category: 'automation', enabled: true,
    tools: [
      { name: 'listWorkflows', description: 'List n8n workflows', inputSchema: { type: 'object', properties: { active: { type: 'boolean' } } } },
      { name: 'executeWorkflow', description: 'Execute n8n workflow', inputSchema: { type: 'object', properties: { workflowId: { type: 'string' }, data: { type: 'object' } }, required: ['workflowId'] } },
      { name: 'createWorkflow', description: 'Create n8n workflow', inputSchema: { type: 'object', properties: { name: { type: 'string' }, nodes: { type: 'array' } }, required: ['name'] } },
      { name: 'getWorkflow', description: 'Get workflow details', inputSchema: { type: 'object', properties: { workflowId: { type: 'string' } }, required: ['workflowId'] } }
    ],
    resources: [
      { uri: 'n8n://workflows', name: 'All Workflows', description: 'List of all n8n workflows' },
      { uri: 'n8n://executions', name: 'Workflow Executions', description: 'Recent workflow executions' }
    ],
    prompts: [{ name: 'create_automation', description: 'Help create n8n automation', arguments: [{ name: 'task', description: 'What to automate', required: true }] }],
    execute: async (tool, params) => {
      if (!process.env.N8N_API_KEY) throw new Error('N8N_API_KEY not configured');
      const res = await axios.post(`${process.env.N8N_BASE_URL}/api/v1/${tool}`, params, { headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY } });
      return res.data;
    }
  },

  // 5. MONGODB
  mongodb: {
    name: 'mongodb', category: 'database', enabled: true,
    tools: [
      { name: 'find', description: 'Find MongoDB documents', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' }, query: { type: 'object' }, limit: { type: 'number' } }, required: ['database', 'collection'] } },
      { name: 'insert', description: 'Insert MongoDB document', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' }, document: { type: 'object' } }, required: ['database', 'collection', 'document'] } },
      { name: 'update', description: 'Update MongoDB documents', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' }, query: { type: 'object' }, update: { type: 'object' } }, required: ['database', 'collection', 'query', 'update'] } },
      { name: 'delete', description: 'Delete MongoDB documents', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' }, query: { type: 'object' } }, required: ['database', 'collection', 'query'] } },
      { name: 'aggregate', description: 'MongoDB aggregation', inputSchema: { type: 'object', properties: { database: { type: 'string' }, collection: { type: 'string' }, pipeline: { type: 'array' } }, required: ['database', 'collection', 'pipeline'] } }
    ],
    resources: [
      { uri: 'mongodb://databases', name: 'Databases', description: 'List all databases' },
      { uri: 'mongodb://collections', name: 'Collections', description: 'List all collections' }
    ],
    prompts: [{ name: 'query_builder', description: 'Help build MongoDB queries', arguments: [{ name: 'description', description: 'What to query', required: true }] }],
    execute: async () => { throw new Error('MONGODB_CONNECTION_STRING not configured'); }
  },

  // 6. LINEAR (GraphQL)
  linear: {
    name: 'linear', category: 'productivity', enabled: true,
    graphql: { endpoint: 'https://api.linear.app/graphql', headers: { Authorization: process.env.LINEAR_API_KEY || '' } },
    tools: [
      { name: 'listIssues', description: 'List Linear issues', inputSchema: { type: 'object', properties: { teamId: { type: 'string' }, filter: { type: 'object' } } } },
      { name: 'createIssue', description: 'Create Linear issue', inputSchema: { type: 'object', properties: { teamId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' } }, required: ['teamId', 'title'] } },
      { name: 'updateIssue', description: 'Update Linear issue', inputSchema: { type: 'object', properties: { issueId: { type: 'string' }, data: { type: 'object' } }, required: ['issueId', 'data'] } },
      { name: 'searchIssues', description: 'Search Linear issues', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
    ],
    resources: [
      { uri: 'linear://teams', name: 'Teams', description: 'All Linear teams' },
      { uri: 'linear://issues', name: 'Issues', description: 'All Linear issues' }
    ],
    prompts: [{ name: 'create_task', description: 'Help create Linear task', arguments: [{ name: 'description', description: 'Task description', required: true }] }],
    execute: async (tool, params) => {
      if (!process.env.LINEAR_API_KEY) throw new Error('LINEAR_API_KEY not configured');
      const queries: Record<string, string> = {
        listIssues: 'query($filter: IssueFilter) { issues(filter: $filter) { nodes { id title state { name } } } }',
        createIssue: 'mutation($teamId: String!, $title: String!, $description: String) { issueCreate(input: { teamId: $teamId, title: $title, description: $description }) { issue { id title } } }',
        updateIssue: 'mutation($issueId: String!, $data: IssueUpdateInput!) { issueUpdate(id: $issueId, input: $data) { issue { id title } } }',
        searchIssues: 'query($query: String!) { issueSearch(query: $query) { nodes { id title } } }'
      };
      return gql('https://api.linear.app/graphql', queries[tool], params, { Authorization: process.env.LINEAR_API_KEY || '' });
    }
  },

  // 7. RAILWAY (GraphQL)
  railway: {
    name: 'railway', category: 'infrastructure', enabled: true,
    graphql: { endpoint: 'https://backboard.railway.app/graphql/v2', headers: { Authorization: `Bearer ${process.env.RAILWAY_API_KEY}` } },
    tools: [
      { name: 'listProjects', description: 'List Railway projects', inputSchema: { type: 'object', properties: {} } },
      { name: 'getProject', description: 'Get Railway project', inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] } },
      { name: 'listServices', description: 'List services', inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] } },
      { name: 'deployService', description: 'Deploy service', inputSchema: { type: 'object', properties: { serviceId: { type: 'string' } }, required: ['serviceId'] } },
      { name: 'getLogs', description: 'Get service logs', inputSchema: { type: 'object', properties: { serviceId: { type: 'string' }, limit: { type: 'number' } }, required: ['serviceId'] } }
    ],
    resources: [
      { uri: 'railway://projects', name: 'Projects', description: 'All Railway projects' },
      { uri: 'railway://deployments', name: 'Deployments', description: 'Recent deployments' }
    ],
    prompts: [{ name: 'deploy_app', description: 'Help deploy to Railway', arguments: [{ name: 'repo', description: 'GitHub repo URL', required: true }] }],
    execute: async (tool, params) => {
      if (!process.env.RAILWAY_API_KEY) throw new Error('RAILWAY_API_KEY not configured');
      const queries: Record<string, string> = {
        listProjects: 'query { projects { edges { node { id name } } } }',
        getProject: 'query($id: String!) { project(id: $id) { id name services { edges { node { id name } } } } }',
        listServices: 'query($projectId: String!) { project(id: $projectId) { services { edges { node { id name } } } } }',
        deployService: 'mutation($serviceId: String!) { serviceDeploy(serviceId: $serviceId) { id status } }',
        getLogs: 'query($serviceId: String!, $limit: Int) { serviceLogs(serviceId: $serviceId, limit: $limit) { logs } }'
      };
      return gql('https://backboard.railway.app/graphql/v2', queries[tool], params, { Authorization: `Bearer ${process.env.RAILWAY_API_KEY}` });
    }
  },

  // 8. GITHUB (GraphQL)
  github: {
    name: 'github', category: 'development', enabled: true,
    graphql: { endpoint: 'https://api.github.com/graphql', headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } },
    tools: [
      { name: 'listRepos', description: 'List GitHub repos', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, limit: { type: 'number' } } } },
      { name: 'createIssue', description: 'Create GitHub issue', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, required: ['owner', 'repo', 'title'] } },
      { name: 'createPR', description: 'Create pull request', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' } }, required: ['owner', 'repo', 'title', 'head', 'base'] } },
      { name: 'searchCode', description: 'Search code', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
    ],
    resources: [
      { uri: 'github://repos', name: 'Repositories', description: 'All repos' },
      { uri: 'github://issues', name: 'Issues', description: 'All issues' }
    ],
    prompts: [{ name: 'code_review', description: 'Help with code review', arguments: [{ name: 'pr_url', description: 'PR URL', required: true }] }],
    execute: async () => { throw new Error('GITHUB_TOKEN not configured'); }
  },

  // 9. OPENAI (Sampling)
  openai: {
    name: 'openai', category: 'ai', enabled: true, supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with GPT', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' }, temperature: { type: 'number' } }, required: ['messages'] } },
      { name: 'completion', description: 'Text completion', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' }, max_tokens: { type: 'number' } }, required: ['prompt'] } },
      { name: 'embedding', description: 'Generate embeddings', inputSchema: { type: 'object', properties: { input: { type: 'string' }, model: { type: 'string' } }, required: ['input'] } },
      { name: 'image', description: 'Generate image with DALL-E', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, size: { type: 'string' } }, required: ['prompt'] } }
    ],
    resources: [{ uri: 'openai://models', name: 'Models', description: 'Available OpenAI models' }],
    prompts: [{ name: 'ai_assistant', description: 'AI assistant', arguments: [{ name: 'task', description: 'Task description', required: true }] }],
    execute: async () => { throw new Error('OPENAI_API_KEY not configured'); }
  },

  // 10. ANTHROPIC (Sampling)
  anthropic: {
    name: 'anthropic', category: 'ai', enabled: true, supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with Claude', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' }, max_tokens: { type: 'number' } }, required: ['messages'] } },
      { name: 'completion', description: 'Text completion', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } }, required: ['prompt'] } }
    ],
    resources: [{ uri: 'anthropic://models', name: 'Models', description: 'Claude models' }],
    prompts: [{ name: 'claude_assistant', description: 'Claude assistant', arguments: [{ name: 'task', description: 'Task', required: true }] }],
    execute: async () => { throw new Error('ANTHROPIC_API_KEY not configured'); }
  },

  // 11-24: Additional servers (all enabled)
  postgres: { name: 'postgres', category: 'database', enabled: true, tools: [{ name: 'query', description: 'SQL query', inputSchema: { type: 'object', properties: { sql: { type: 'string' }, params: { type: 'array' } }, required: ['sql'] } }], resources: [{ uri: 'postgres://tables', name: 'Tables', description: 'All tables' }], execute: async () => { throw new Error('POSTGRES_CONNECTION_STRING not configured'); } },
  sqlite: { name: 'sqlite', category: 'database', enabled: true, tools: [{ name: 'query', description: 'SQL query', inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] } }], resources: [{ uri: 'sqlite://tables', name: 'Tables', description: 'All tables' }], execute: async () => { throw new Error('SQLITE_DB_PATH not configured'); } },
  notion: { name: 'notion', category: 'productivity', enabled: true, tools: [{ name: 'queryDatabase', description: 'Query database', inputSchema: { type: 'object', properties: { databaseId: { type: 'string' }, filter: { type: 'object' } }, required: ['databaseId'] } }, { name: 'createPage', description: 'Create page', inputSchema: { type: 'object', properties: { parent: { type: 'object' }, properties: { type: 'object' } }, required: ['parent'] } }], resources: [{ uri: 'notion://databases', name: 'Databases', description: 'All databases' }], execute: async () => { throw new Error('NOTION_API_KEY not configured'); } },
  slack: { name: 'slack', category: 'communication', enabled: true, tools: [{ name: 'postMessage', description: 'Post message', inputSchema: { type: 'object', properties: { channel: { type: 'string' }, text: { type: 'string' } }, required: ['channel', 'text'] } }, { name: 'listChannels', description: 'List channels', inputSchema: { type: 'object', properties: {} } }], resources: [{ uri: 'slack://channels', name: 'Channels', description: 'All channels' }], execute: async () => { throw new Error('SLACK_BOT_TOKEN not configured'); } },
  airtable: { name: 'airtable', category: 'productivity', enabled: true, tools: [{ name: 'listRecords', description: 'List records', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' } }, required: ['baseId', 'tableId'] } }], resources: [{ uri: 'airtable://bases', name: 'Bases', description: 'All bases' }], execute: async () => { throw new Error('AIRTABLE_API_KEY not configured'); } },
  doppler: { name: 'doppler', category: 'security', enabled: true, tools: [{ name: 'getSecrets', description: 'Get secrets', inputSchema: { type: 'object', properties: { project: { type: 'string' } }, required: ['project'] } }], resources: [{ uri: 'doppler://projects', name: 'Projects', description: 'All projects' }], execute: async () => { throw new Error('DOPPLER_API_KEY not configured'); } },
  raindrop: { name: 'raindrop', category: 'productivity', enabled: true, tools: [{ name: 'listBookmarks', description: 'List bookmarks', inputSchema: { type: 'object', properties: {} } }], resources: [{ uri: 'raindrop://collections', name: 'Collections', description: 'All collections' }], execute: async () => { throw new Error('RAINDROP_API_KEY not configured'); } },
  postman: { name: 'postman', category: 'development', enabled: true, tools: [{ name: 'listCollections', description: 'List collections', inputSchema: { type: 'object', properties: {} } }], resources: [{ uri: 'postman://collections', name: 'Collections', description: 'All collections' }], execute: async () => { throw new Error('POSTMAN_API_KEY not configured'); } },
  googleDrive: { name: 'google-drive', category: 'storage', enabled: true, tools: [{ name: 'listFiles', description: 'List files', inputSchema: { type: 'object', properties: { folderId: { type: 'string' } } } }], resources: [{ uri: 'gdrive://files', name: 'Files', description: 'All files' }], execute: async () => { throw new Error('GOOGLE_DRIVE_CREDENTIALS not configured'); } },
  ollama: { name: 'ollama', category: 'ai', enabled: true, supportsSampling: true, tools: [{ name: 'chat', description: 'Chat with Ollama', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' } }, required: ['model', 'messages'] } }], resources: [{ uri: 'ollama://models', name: 'Models', description: 'Available models' }], execute: async () => { throw new Error('OLLAMA_BASE_URL not configured'); } },
  braveSearch: { name: 'brave-search', category: 'search', enabled: true, tools: [{ name: 'webSearch', description: 'Search web', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }], resources: [{ uri: 'brave://results', name: 'Results', description: 'Search results' }], execute: async () => { throw new Error('BRAVE_SEARCH_API_KEY not configured'); } },
  puppeteer: { name: 'puppeteer', category: 'automation', enabled: true, tools: [{ name: 'navigate', description: 'Navigate', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } }], resources: [{ uri: 'puppeteer://sessions', name: 'Sessions', description: 'Active sessions' }], execute: async () => { throw new Error('PUPPETEER_EXECUTABLE_PATH not configured'); } },
  sentry: { name: 'sentry', category: 'monitoring', enabled: true, tools: [{ name: 'captureError', description: 'Capture error', inputSchema: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } }], resources: [{ uri: 'sentry://issues', name: 'Issues', description: 'All issues' }], execute: async () => { throw new Error('SENTRY_DSN not configured'); } },
  strapi: { name: 'strapi', category: 'cms', enabled: true, tools: [{ name: 'getEntries', description: 'Get entries', inputSchema: { type: 'object', properties: { contentType: { type: 'string' } }, required: ['contentType'] } }], resources: [{ uri: 'strapi://content-types', name: 'Content Types', description: 'All content types' }], execute: async () => { throw new Error('STRAPI_URL not configured'); } },
  stripe: { name: 'stripe', category: 'payments', enabled: true, tools: [{ name: 'listCustomers', description: 'List customers', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } }], resources: [{ uri: 'stripe://customers', name: 'Customers', description: 'All customers' }], execute: async () => { throw new Error('STRIPE_API_KEY not configured'); } }
};
