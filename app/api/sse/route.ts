// SSE (Server-Sent Events) endpoint for MCP protocol
// Compatible with Cursor IDE MCP client: { "type": "sse", "url": "https://your-bridge.railway.app/api/sse" }

import { MCP_SERVERS } from '../mcp-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send server info on connect
      const enabledServers = Object.values(MCP_SERVERS).filter(s => s.enabled);
      
      send({
        type: 'connection',
        timestamp: new Date().toISOString(),
        servers: enabledServers.map(s => ({
          name: s.name,
          category: s.category,
          tools: s.tools.map(t => t.name),
          resources: s.resources?.map(r => r.uri) || [],
          prompts: s.prompts?.map(p => p.name) || [],
          supportsSampling: s.supportsSampling || false,
          hasGraphQL: !!s.graphql
        }))
      });

      // Send tools list
      send({
        type: 'tools',
        tools: enabledServers.flatMap(s => 
          s.tools.map(t => ({
            server: s.name,
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
          }))
        )
      });

      // Send resources list
      send({
        type: 'resources',
        resources: enabledServers.flatMap(s => 
          (s.resources || []).map(r => ({
            server: s.name,
            uri: r.uri,
            name: r.name,
            description: r.description
          }))
        )
      });

      // Send prompts list
      send({
        type: 'prompts',
        prompts: enabledServers.flatMap(s => 
          (s.prompts || []).map(p => ({
            server: s.name,
            name: p.name,
            description: p.description,
            arguments: p.arguments || []
          }))
        )
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          send({ type: 'ping', timestamp: new Date().toISOString() });
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

