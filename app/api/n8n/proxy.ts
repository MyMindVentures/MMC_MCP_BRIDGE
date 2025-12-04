// n8n Community MCP Server Proxy
// Integrates @leonardsellem/n8n-mcp-server into our bridge

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let mcpClient: Client | null = null;
let clientInitialized = false;

// Initialize MCP client connection to n8n-mcp-server
async function initializeClient() {
  if (clientInitialized) return mcpClient;
  
  try {
    // Support both new and legacy env vars
    const apiKey = process.env.N8N_INSTANCE_APIKEY || process.env.N8N_API_KEY;
    const baseUrl = process.env.N8N_BASE_URL || 'https://mmc-n8n-instance.up.railway.app';
    
    if (!apiKey) {
      console.log('[n8n-community] N8N_INSTANCE_APIKEY or N8N_API_KEY not configured, skipping');
      return null;
    }

    console.log(`[n8n-community] Initializing with URL: ${baseUrl}/api/v1`);

    // StdioClientTransport spawns its own process internally
    const transport = new StdioClientTransport({
      command: 'node',
      args: [require.resolve('@leonardsellem/n8n-mcp-server/build/index.js')],
      env: {
        ...process.env, // Pass all env vars
        N8N_API_URL: `${baseUrl}/api/v1`,
        N8N_API_KEY: apiKey
      }
    });

    mcpClient = new Client({
      name: 'mmc-bridge-n8n-community',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    clientInitialized = true;
    
    console.log('[n8n-community] Connected to @leonardsellem/n8n-mcp-server');
    return mcpClient;
  } catch (error: any) {
    console.error('[n8n-community] Failed to initialize:', error.message);
    return null;
  }
}

// Get all tools from n8n-community MCP server
export async function getN8NCommunityTools() {
  try {
    const client = await initializeClient();
    if (!client) return [];

    const result = await client.listTools();
    return result.tools || [];
  } catch (error: any) {
    console.error('[n8n-community] Failed to list tools:', error.message);
    return [];
  }
}

// Execute tool via n8n-community MCP server
export async function executeN8NCommunityTool(toolName: string, params: any) {
  try {
    const client = await initializeClient();
    if (!client) {
      throw new Error('n8n-community MCP client not initialized');
    }

    const result = await client.callTool({
      name: toolName,
      arguments: params
    });

    return result;
  } catch (error: any) {
    console.error(`[n8n-community] Failed to execute ${toolName}:`, error.message);
    throw error;
  }
}

// Get resources
export async function getN8NCommunityResources() {
  try {
    const client = await initializeClient();
    if (!client) return [];

    const result = await client.listResources();
    return result.resources || [];
  } catch (error: any) {
    console.error('[n8n-community] Failed to list resources:', error.message);
    return [];
  }
}

// Get prompts
export async function getN8NCommunityPrompts() {
  try {
    const client = await initializeClient();
    if (!client) return [];

    const result = await client.listPrompts();
    return result.prompts || [];
  } catch (error: any) {
    console.error('[n8n-community] Failed to list prompts:', error.message);
    return [];
  }
}

console.log('[n8n-community] Proxy initialized');

