// MCP SERVERS REGISTRY - Complete Implementation
// Tools + Resources + Prompts + Sampling + GraphQL Wrappers

import axios from 'axios';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MCP PROTOCOL TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export interface MCPServer {
  name: string;
  category: string;
  enabled: boolean;
  tools: MCPTool[];
  resources?: MCPResource[];
  prompts?: MCPPrompt[];
  supportsSampling?: boolean;
  graphql?: {
    endpoint: string;
    headers: Record<string, string>;
  };
  execute?: (tool: string, params: any) => Promise<any>;
  getResource?: (uri: string) => Promise<any>;
  executePrompt?: (name: string, args: any) => Promise<any>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRAPHQL WRAPPER UTILITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function executeGraphQL(endpoint: string, query: string, variables: any, headers: Record<string, string>) {
  const response = await axios.post(endpoint, { query, variables }, { headers });
  return response.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MCP SERVERS REGISTRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MCP_SERVERS: Record<string, MCPServer> = {
  // N8N - Workflow Automation
  n8n: {
    name: 'n8n',
    category: 'automation',
    enabled: !!process.env.N8N_API_KEY,
    tools: [
      {
        name: 'listWorkflows',
        description: 'List all n8n workflows',
        inputSchema: { type: 'object', properties: { active: { type: 'boolean' } } }
      },
      {
        name: 'executeWorkflow',
        description: 'Execute an n8n workflow',
        inputSchema: {
          type: 'object',
          properties: { workflowId: { type: 'string' }, data: { type: 'object' } },
          required: ['workflowId']
        }
      },
      {
        name: 'createWorkflow',
        description: 'Create a new n8n workflow',
        inputSchema: {
          type: 'object',
          properties: { name: { type: 'string' }, nodes: { type: 'array' } },
          required: ['name', 'nodes']
        }
      }
    ],
    resources: [
      { uri: 'n8n://workflows', name: 'All Workflows', description: 'List of all n8n workflows' },
      { uri: 'n8n://executions', name: 'Workflow Executions', description: 'Recent workflow executions' }
    ],
    prompts: [
      {
        name: 'create_automation',
        description: 'Help create an n8n automation workflow',
        arguments: [{ name: 'task', description: 'What to automate', required: true }]
      }
    ],
    execute: async (tool: string, params: any) => {
      const res = await axios.post(`${process.env.N8N_BASE_URL}/api/v1/${tool}`, params, {
        headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
      });
      return res.data;
    },
    getResource: async (uri: string) => {
      const path = uri.replace('n8n://', '');
      const res = await axios.get(`${process.env.N8N_BASE_URL}/api/v1/${path}`, {
        headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
      });
      return res.data;
    }
  },

  // RAILWAY - Infrastructure (GraphQL)
  railway: {
    name: 'railway',
    category: 'infrastructure',
    enabled: !!process.env.RAILWAY_API_KEY,
    graphql: {
      endpoint: 'https://backboard.railway.app/graphql/v2',
      headers: { Authorization: `Bearer ${process.env.RAILWAY_API_KEY}` }
    },
    tools: [
      {
        name: 'listProjects',
        description: 'List all Railway projects',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'getProject',
        description: 'Get Railway project details',
        inputSchema: {
          type: 'object',
          properties: { projectId: { type: 'string' } },
          required: ['projectId']
        }
      },
      {
        name: 'listServices',
        description: 'List services in a project',
        inputSchema: {
          type: 'object',
          properties: { projectId: { type: 'string' } },
          required: ['projectId']
        }
      },
      {
        name: 'deployService',
        description: 'Deploy a Railway service',
        inputSchema: {
          type: 'object',
          properties: { serviceId: { type: 'string' } },
          required: ['serviceId']
        }
      },
      {
        name: 'getLogs',
        description: 'Get service logs',
        inputSchema: {
          type: 'object',
          properties: { serviceId: { type: 'string' }, limit: { type: 'number' } },
          required: ['serviceId']
        }
      }
    ],
    resources: [
      { uri: 'railway://projects', name: 'Projects', description: 'All Railway projects' },
      { uri: 'railway://deployments', name: 'Deployments', description: 'Recent deployments' }
    ],
    prompts: [
      {
        name: 'deploy_app',
        description: 'Help deploy an application to Railway',
        arguments: [{ name: 'repo', description: 'GitHub repository URL', required: true }]
      }
    ],
    execute: async (tool: string, params: any) => {
      const queries: Record<string, string> = {
        listProjects: 'query { projects { edges { node { id name } } } }',
        getProject: 'query($id: String!) { project(id: $id) { id name services { edges { node { id name } } } } }',
        listServices: 'query($projectId: String!) { project(id: $projectId) { services { edges { node { id name } } } } }',
        deployService: 'mutation($serviceId: String!) { serviceDeploy(serviceId: $serviceId) { id status } }',
        getLogs: 'query($serviceId: String!, $limit: Int) { serviceLogs(serviceId: $serviceId, limit: $limit) { logs } }'
      };
      return executeGraphQL(
        'https://backboard.railway.app/graphql/v2',
        queries[tool],
        params,
        { Authorization: `Bearer ${process.env.RAILWAY_API_KEY}` }
      );
    }
  },

  // MONGODB - Database
  mongodb: {
    name: 'mongodb',
    category: 'database',
    enabled: !!process.env.MONGODB_CONNECTION_STRING,
    tools: [
      {
        name: 'find',
        description: 'Find documents in MongoDB collection',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string' },
            collection: { type: 'string' },
            query: { type: 'object' },
            limit: { type: 'number' }
          },
          required: ['database', 'collection']
        }
      },
      {
        name: 'insert',
        description: 'Insert document into MongoDB collection',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string' },
            collection: { type: 'string' },
            document: { type: 'object' }
          },
          required: ['database', 'collection', 'document']
        }
      },
      {
        name: 'update',
        description: 'Update documents in MongoDB collection',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string' },
            collection: { type: 'string' },
            query: { type: 'object' },
            update: { type: 'object' }
          },
          required: ['database', 'collection', 'query', 'update']
        }
      },
      {
        name: 'delete',
        description: 'Delete documents from MongoDB collection',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string' },
            collection: { type: 'string' },
            query: { type: 'object' }
          },
          required: ['database', 'collection', 'query']
        }
      },
      {
        name: 'aggregate',
        description: 'Run aggregation pipeline on MongoDB collection',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string' },
            collection: { type: 'string' },
            pipeline: { type: 'array' }
          },
          required: ['database', 'collection', 'pipeline']
        }
      }
    ],
    resources: [
      { uri: 'mongodb://databases', name: 'Databases', description: 'List all databases' },
      { uri: 'mongodb://collections', name: 'Collections', description: 'List all collections' }
    ],
    prompts: [
      {
        name: 'query_builder',
        description: 'Help build MongoDB queries',
        arguments: [{ name: 'description', description: 'Describe what you want to query', required: true }]
      }
    ]
  },

  // POSTGRES - Database
  postgres: {
    name: 'postgres',
    category: 'database',
    enabled: !!process.env.POSTGRES_CONNECTION_STRING,
    tools: [
      {
        name: 'query',
        description: 'Execute SQL query on PostgreSQL',
        inputSchema: {
          type: 'object',
          properties: { sql: { type: 'string' }, params: { type: 'array' } },
          required: ['sql']
        }
      },
      {
        name: 'insert',
        description: 'Insert row into PostgreSQL table',
        inputSchema: {
          type: 'object',
          properties: { table: { type: 'string' }, data: { type: 'object' } },
          required: ['table', 'data']
        }
      },
      {
        name: 'update',
        description: 'Update rows in PostgreSQL table',
        inputSchema: {
          type: 'object',
          properties: { table: { type: 'string' }, data: { type: 'object' }, where: { type: 'object' } },
          required: ['table', 'data', 'where']
        }
      },
      {
        name: 'delete',
        description: 'Delete rows from PostgreSQL table',
        inputSchema: {
          type: 'object',
          properties: { table: { type: 'string' }, where: { type: 'object' } },
          required: ['table', 'where']
        }
      }
    ],
    resources: [
      { uri: 'postgres://schema', name: 'Database Schema', description: 'Database schema information' },
      { uri: 'postgres://tables', name: 'Tables', description: 'List all tables' }
    ],
    prompts: [
      {
        name: 'sql_helper',
        description: 'Help write SQL queries',
        arguments: [{ name: 'task', description: 'What you want to do', required: true }]
      }
    ]
  },

  // LINEAR - Project Management (GraphQL)
  linear: {
    name: 'linear',
    category: 'productivity',
    enabled: !!process.env.LINEAR_API_KEY,
    graphql: {
      endpoint: 'https://api.linear.app/graphql',
      headers: { Authorization: process.env.LINEAR_API_KEY || '' }
    },
    tools: [
      {
        name: 'listIssues',
        description: 'List Linear issues',
        inputSchema: {
          type: 'object',
          properties: { teamId: { type: 'string' }, filter: { type: 'object' } }
        }
      },
      {
        name: 'createIssue',
        description: 'Create a new Linear issue',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'number' }
          },
          required: ['teamId', 'title']
        }
      },
      {
        name: 'updateIssue',
        description: 'Update a Linear issue',
        inputSchema: {
          type: 'object',
          properties: { issueId: { type: 'string' }, data: { type: 'object' } },
          required: ['issueId', 'data']
        }
      },
      {
        name: 'searchIssues',
        description: 'Search Linear issues',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query']
        }
      }
    ],
    resources: [
      { uri: 'linear://teams', name: 'Teams', description: 'All Linear teams' },
      { uri: 'linear://projects', name: 'Projects', description: 'All Linear projects' },
      { uri: 'linear://issues', name: 'Issues', description: 'All Linear issues' }
    ],
    prompts: [
      {
        name: 'create_task',
        description: 'Help create a Linear task',
        arguments: [{ name: 'description', description: 'Task description', required: true }]
      }
    ],
    execute: async (tool: string, params: any) => {
      const queries: Record<string, string> = {
        listIssues: 'query($filter: IssueFilter) { issues(filter: $filter) { nodes { id title state { name } } } }',
        createIssue: 'mutation($teamId: String!, $title: String!, $description: String, $priority: Int) { issueCreate(input: { teamId: $teamId, title: $title, description: $description, priority: $priority }) { issue { id title } } }',
        updateIssue: 'mutation($issueId: String!, $data: IssueUpdateInput!) { issueUpdate(id: $issueId, input: $data) { issue { id title } } }',
        searchIssues: 'query($query: String!) { issueSearch(query: $query) { nodes { id title } } }'
      };
      return executeGraphQL(
        'https://api.linear.app/graphql',
        queries[tool],
        params,
        { Authorization: process.env.LINEAR_API_KEY || '' }
      );
    }
  },

  // GITHUB - Development (GraphQL)
  github: {
    name: 'github',
    category: 'development',
    enabled: !!process.env.GITHUB_TOKEN,
    graphql: {
      endpoint: 'https://api.github.com/graphql',
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    },
    tools: [
      {
        name: 'listRepos',
        description: 'List GitHub repositories',
        inputSchema: {
          type: 'object',
          properties: { owner: { type: 'string' }, limit: { type: 'number' } }
        }
      },
      {
        name: 'createIssue',
        description: 'Create a GitHub issue',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' }
          },
          required: ['owner', 'repo', 'title']
        }
      },
      {
        name: 'createPR',
        description: 'Create a GitHub pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            title: { type: 'string' },
            head: { type: 'string' },
            base: { type: 'string' }
          },
          required: ['owner', 'repo', 'title', 'head', 'base']
        }
      },
      {
        name: 'searchCode',
        description: 'Search code on GitHub',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query']
        }
      }
    ],
    resources: [
      { uri: 'github://repos', name: 'Repositories', description: 'All accessible repositories' },
      { uri: 'github://issues', name: 'Issues', description: 'All issues' },
      { uri: 'github://pulls', name: 'Pull Requests', description: 'All pull requests' }
    ],
    prompts: [
      {
        name: 'code_review',
        description: 'Help with code review',
        arguments: [{ name: 'pr_url', description: 'Pull request URL', required: true }]
      }
    ],
    execute: async (tool: string, params: any) => {
      const queries: Record<string, string> = {
        listRepos: 'query($owner: String!, $limit: Int) { user(login: $owner) { repositories(first: $limit) { nodes { name description } } } }',
        createIssue: 'mutation($owner: String!, $repo: String!, $title: String!, $body: String) { createIssue(input: { repositoryId: $repo, title: $title, body: $body }) { issue { id number } } }',
        createPR: 'mutation($owner: String!, $repo: String!, $title: String!, $head: String!, $base: String!) { createPullRequest(input: { repositoryId: $repo, title: $title, headRefName: $head, baseRefName: $base }) { pullRequest { id number } } }',
        searchCode: 'query($query: String!) { search(query: $query, type: CODE, first: 10) { nodes { ... on Repository { name } } } }'
      };
      return executeGraphQL(
        'https://api.github.com/graphql',
        queries[tool],
        params,
        { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      );
    }
  },

  // Additional servers with basic configs
  notion: {
    name: 'notion',
    category: 'productivity',
    enabled: !!process.env.NOTION_API_KEY,
    tools: [
      { name: 'queryDatabase', description: 'Query a Notion database', inputSchema: { type: 'object', properties: { databaseId: { type: 'string' }, filter: { type: 'object' } }, required: ['databaseId'] } },
      { name: 'createPage', description: 'Create a new Notion page', inputSchema: { type: 'object', properties: { parent: { type: 'object' }, properties: { type: 'object' } }, required: ['parent', 'properties'] } },
      { name: 'updatePage', description: 'Update a Notion page', inputSchema: { type: 'object', properties: { pageId: { type: 'string' }, properties: { type: 'object' } }, required: ['pageId', 'properties'] } }
    ],
    resources: [
      { uri: 'notion://databases', name: 'Databases', description: 'All Notion databases' },
      { uri: 'notion://pages', name: 'Pages', description: 'All Notion pages' }
    ],
    prompts: [{ name: 'create_doc', description: 'Help create a Notion document', arguments: [{ name: 'topic', description: 'Document topic', required: true }] }]
  },

  slack: {
    name: 'slack',
    category: 'communication',
    enabled: !!process.env.SLACK_BOT_TOKEN,
    tools: [
      { name: 'postMessage', description: 'Post a message to Slack', inputSchema: { type: 'object', properties: { channel: { type: 'string' }, text: { type: 'string' } }, required: ['channel', 'text'] } },
      { name: 'listChannels', description: 'List Slack channels', inputSchema: { type: 'object', properties: {} } },
      { name: 'uploadFile', description: 'Upload a file to Slack', inputSchema: { type: 'object', properties: { channels: { type: 'string' }, file: { type: 'string' } }, required: ['channels', 'file'] } }
    ],
    resources: [
      { uri: 'slack://channels', name: 'Channels', description: 'All Slack channels' },
      { uri: 'slack://users', name: 'Users', description: 'All Slack users' }
    ],
    prompts: [{ name: 'compose_message', description: 'Help compose a Slack message', arguments: [{ name: 'purpose', description: 'Message purpose', required: true }] }]
  },

  openai: {
    name: 'openai',
    category: 'ai',
    enabled: !!process.env.OPENAI_API_KEY,
    supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with OpenAI models', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' }, temperature: { type: 'number' } }, required: ['messages'] } },
      { name: 'completion', description: 'Text completion with OpenAI', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } }, required: ['prompt'] } },
      { name: 'embedding', description: 'Generate embeddings', inputSchema: { type: 'object', properties: { input: { type: 'string' }, model: { type: 'string' } }, required: ['input'] } },
      { name: 'image', description: 'Generate images with DALL-E', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, size: { type: 'string' } }, required: ['prompt'] } }
    ],
    resources: [{ uri: 'openai://models', name: 'Models', description: 'Available OpenAI models' }],
    prompts: [{ name: 'ai_assistant', description: 'AI assistant for various tasks', arguments: [{ name: 'task', description: 'Task description', required: true }] }]
  },

  anthropic: {
    name: 'anthropic',
    category: 'ai',
    enabled: !!process.env.ANTHROPIC_API_KEY,
    supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with Claude', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' }, max_tokens: { type: 'number' } }, required: ['messages'] } },
      { name: 'completion', description: 'Text completion with Claude', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } }, required: ['prompt'] } }
    ],
    resources: [{ uri: 'anthropic://models', name: 'Models', description: 'Available Claude models' }],
    prompts: [{ name: 'claude_assistant', description: 'Claude AI assistant', arguments: [{ name: 'task', description: 'Task description', required: true }] }]
  },

  git: {
    name: 'git',
    category: 'development',
    enabled: true,
    tools: [
      { name: 'clone', description: 'Clone a git repository', inputSchema: { type: 'object', properties: { url: { type: 'string' }, path: { type: 'string' } }, required: ['url'] } },
      { name: 'commit', description: 'Commit changes', inputSchema: { type: 'object', properties: { message: { type: 'string' }, files: { type: 'array' } }, required: ['message'] } },
      { name: 'push', description: 'Push commits to remote', inputSchema: { type: 'object', properties: { remote: { type: 'string' }, branch: { type: 'string' } } } },
      { name: 'pull', description: 'Pull changes from remote', inputSchema: { type: 'object', properties: { remote: { type: 'string' }, branch: { type: 'string' } } } },
      { name: 'branch', description: 'Manage git branches', inputSchema: { type: 'object', properties: { action: { type: 'string' }, name: { type: 'string' } } } }
    ],
    resources: [
      { uri: 'git://status', name: 'Git Status', description: 'Current git status' },
      { uri: 'git://branches', name: 'Branches', description: 'All git branches' },
      { uri: 'git://log', name: 'Commit Log', description: 'Recent commits' }
    ],
    prompts: [{ name: 'commit_message', description: 'Help write commit messages', arguments: [{ name: 'changes', description: 'What changed', required: true }] }]
  },

  filesystem: {
    name: 'filesystem',
    category: 'development',
    enabled: true,
    tools: [
      { name: 'readFile', description: 'Read a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'writeFile', description: 'Write to a file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
      { name: 'listDir', description: 'List directory contents', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'deleteFile', description: 'Delete a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } }
    ],
    resources: [{ uri: 'file:///', name: 'Root Directory', description: 'Root filesystem access' }],
    prompts: [{ name: 'file_operations', description: 'Help with file operations', arguments: [{ name: 'operation', description: 'What to do', required: true }] }]
  },

  playwright: {
    name: 'playwright',
    category: 'automation',
    enabled: true,
    tools: [
      { name: 'navigate', description: 'Navigate to a URL', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'screenshot', description: 'Take a screenshot', inputSchema: { type: 'object', properties: { url: { type: 'string' }, selector: { type: 'string' } }, required: ['url'] } },
      { name: 'scrape', description: 'Scrape web content', inputSchema: { type: 'object', properties: { url: { type: 'string' }, selector: { type: 'string' } }, required: ['url'] } },
      { name: 'interact', description: 'Interact with web elements', inputSchema: { type: 'object', properties: { url: { type: 'string' }, actions: { type: 'array' } }, required: ['url', 'actions'] } }
    ],
    resources: [{ uri: 'playwright://browsers', name: 'Browsers', description: 'Available browsers' }],
    prompts: [{ name: 'web_automation', description: 'Help automate web tasks', arguments: [{ name: 'task', description: 'What to automate', required: true }] }]
  },

  // Additional servers
  sqlite: {
    name: 'sqlite',
    category: 'database',
    enabled: !!process.env.SQLITE_DB_PATH,
    tools: [
      { name: 'query', description: 'Execute SQLite query', inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] } },
      { name: 'insert', description: 'Insert into SQLite', inputSchema: { type: 'object', properties: { table: { type: 'string' }, data: { type: 'object' } }, required: ['table', 'data'] } }
    ],
    resources: [{ uri: 'sqlite://tables', name: 'Tables', description: 'All tables' }]
  },

  airtable: {
    name: 'airtable',
    category: 'productivity',
    enabled: !!process.env.AIRTABLE_API_KEY,
    tools: [
      { name: 'listRecords', description: 'List Airtable records', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' } }, required: ['baseId', 'tableId'] } },
      { name: 'createRecord', description: 'Create Airtable record', inputSchema: { type: 'object', properties: { baseId: { type: 'string' }, tableId: { type: 'string' }, fields: { type: 'object' } }, required: ['baseId', 'tableId', 'fields'] } }
    ],
    resources: [{ uri: 'airtable://bases', name: 'Bases', description: 'All Airtable bases' }]
  },

  doppler: {
    name: 'doppler',
    category: 'security',
    enabled: !!process.env.DOPPLER_API_KEY,
    tools: [
      { name: 'getSecrets', description: 'Get Doppler secrets', inputSchema: { type: 'object', properties: { project: { type: 'string' } }, required: ['project'] } },
      { name: 'updateSecret', description: 'Update Doppler secret', inputSchema: { type: 'object', properties: { project: { type: 'string' }, name: { type: 'string' }, value: { type: 'string' } }, required: ['project', 'name', 'value'] } }
    ],
    resources: [{ uri: 'doppler://projects', name: 'Projects', description: 'All Doppler projects' }]
  },

  raindrop: {
    name: 'raindrop',
    category: 'productivity',
    enabled: !!process.env.RAINDROP_API_KEY,
    tools: [
      { name: 'listBookmarks', description: 'List bookmarks', inputSchema: { type: 'object', properties: {} } },
      { name: 'createBookmark', description: 'Create bookmark', inputSchema: { type: 'object', properties: { url: { type: 'string' }, title: { type: 'string' } }, required: ['url'] } }
    ],
    resources: [{ uri: 'raindrop://collections', name: 'Collections', description: 'All collections' }]
  },

  postman: {
    name: 'postman',
    category: 'development',
    enabled: !!process.env.POSTMAN_API_KEY,
    tools: [
      { name: 'listCollections', description: 'List Postman collections', inputSchema: { type: 'object', properties: {} } },
      { name: 'runCollection', description: 'Run Postman collection', inputSchema: { type: 'object', properties: { collectionId: { type: 'string' } }, required: ['collectionId'] } }
    ],
    resources: [{ uri: 'postman://collections', name: 'Collections', description: 'All collections' }]
  },

  googleDrive: {
    name: 'google-drive',
    category: 'storage',
    enabled: !!process.env.GOOGLE_DRIVE_CREDENTIALS,
    tools: [
      { name: 'listFiles', description: 'List Google Drive files', inputSchema: { type: 'object', properties: { folderId: { type: 'string' } } } },
      { name: 'uploadFile', description: 'Upload file to Google Drive', inputSchema: { type: 'object', properties: { name: { type: 'string' }, content: { type: 'string' } }, required: ['name', 'content'] } }
    ],
    resources: [{ uri: 'gdrive://files', name: 'Files', description: 'All files' }]
  },

  ollama: {
    name: 'ollama',
    category: 'ai',
    enabled: !!process.env.OLLAMA_BASE_URL,
    supportsSampling: true,
    tools: [
      { name: 'chat', description: 'Chat with Ollama', inputSchema: { type: 'object', properties: { model: { type: 'string' }, messages: { type: 'array' } }, required: ['model', 'messages'] } },
      { name: 'generate', description: 'Generate text', inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' } }, required: ['model', 'prompt'] } }
    ],
    resources: [{ uri: 'ollama://models', name: 'Models', description: 'Available models' }]
  },

  braveSearch: {
    name: 'brave-search',
    category: 'search',
    enabled: !!process.env.BRAVE_SEARCH_API_KEY,
    tools: [
      { name: 'webSearch', description: 'Search the web', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
      { name: 'imageSearch', description: 'Search images', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
    ],
    resources: [{ uri: 'brave://results', name: 'Recent Searches', description: 'Recent search results' }]
  },

  puppeteer: {
    name: 'puppeteer',
    category: 'automation',
    enabled: !!process.env.PUPPETEER_EXECUTABLE_PATH,
    tools: [
      { name: 'navigate', description: 'Navigate with Puppeteer', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'screenshot', description: 'Take screenshot', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } }
    ],
    resources: [{ uri: 'puppeteer://sessions', name: 'Sessions', description: 'Active sessions' }]
  },

  sentry: {
    name: 'sentry',
    category: 'monitoring',
    enabled: !!process.env.SENTRY_DSN,
    tools: [
      { name: 'captureError', description: 'Capture error in Sentry', inputSchema: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } },
      { name: 'listIssues', description: 'List Sentry issues', inputSchema: { type: 'object', properties: { project: { type: 'string' } } } }
    ],
    resources: [{ uri: 'sentry://issues', name: 'Issues', description: 'All issues' }]
  }
};

