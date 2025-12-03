// SSE (Server-Sent Events) endpoint for MCP protocol
// Apollo MCP Server compatible: https://www.apollographql.com/docs/apollo-mcp-server
// Cursor IDE config: { "type": "sse", "url": "https://your-bridge.railway.app/api/sse" }

import { MCP_SERVERS } from '../mcp-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
      
      // MCP Protocol: Send server info
      send('message', {
        jsonrpc: '2.0',
        method: 'server/info',
        params: {
          name: 'MMC-MCP-Bridge',
          version: '2.0.0',
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
            sampling: {}
          },
          serverInfo: {
            totalServers: Object.keys(MCP_SERVERS).length,
            enabledServers: enabledServers.length,
            servers: enabledServers.map(s => s.name)
          }
        }
      });

      // MCP Protocol: List tools
      send('message', {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {
          tools: enabledServers.flatMap(s => 
            s.tools.map(t => ({
              name: `${s.name}_${t.name}`,
              description: `[${s.name}] ${t.description}`,
              inputSchema: t.inputSchema
            }))
          )
        }
      });

      // MCP Protocol: List resources
      send('message', {
        jsonrpc: '2.0',
        method: 'resources/list',
        params: {
          resources: enabledServers.flatMap(s => 
            (s.resources || []).map(r => ({
              uri: r.uri,
              name: `[${s.name}] ${r.name}`,
              description: r.description,
              mimeType: 'application/json'
            }))
          )
        }
      });

      // MCP Protocol: List prompts
      send('message', {
        jsonrpc: '2.0',
        method: 'prompts/list',
        params: {
          prompts: enabledServers.flatMap(s => 
            (s.prompts || []).map(p => ({
              name: `${s.name}_${p.name}`,
              description: `[${s.name}] ${p.description}`,
              arguments: p.arguments || []
            }))
          )
        }
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          send('ping', { timestamp: new Date().toISOString() });
        } catch (error) {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// MCP Protocol: Handle tool invocations via POST
export async function POST(request: Request) {
  let requestId: any = null;
  
  try {
    const body = await request.json();
    requestId = body.id; // Capture id for error responses
    
    // MCP JSON-RPC 2.0 format
    if (body.jsonrpc === '2.0' && body.method === 'tools/call') {
      const { name, arguments: args } = body.params;
      
      // Parse tool name: "server_tool"
      const [serverName, toolName] = name.split('_', 2);
      const server = MCP_SERVERS[serverName];
      
      if (!server || !server.enabled) {
        return Response.json({
          jsonrpc: '2.0',
          id: requestId,
          error: { code: -32602, message: 'Server not found or disabled' }
        });
      }
      
      const tool = server.tools.find(t => t.name === toolName);
      if (!tool) {
        return Response.json({
          jsonrpc: '2.0',
          id: requestId,
          error: { code: -32602, message: 'Tool not found' }
        });
      }
      
      const result = server.execute
        ? await server.execute(toolName, args)
        : { message: `${serverName}.${toolName} executed`, params: args };
      
      return Response.json({
        jsonrpc: '2.0',
        id: requestId,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      });
    }
    
    return Response.json({
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32601, message: 'Method not found' }
    });
  } catch (error: any) {
    // JSON-RPC 2.0: Always include id in error response when available
    return Response.json({
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32603, message: error.message }
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

