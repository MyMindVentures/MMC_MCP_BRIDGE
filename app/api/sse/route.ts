// SSE (Server-Sent Events) endpoint for MCP protocol
// Apollo MCP Server compatible: https://www.apollographql.com/docs/apollo-mcp-server
// Cursor IDE config: { "type": "sse", "url": "https://your-bridge.railway.app/api/sse" }

import { MCP_SERVERS } from "../mcp-config";
import { executeMCPTool } from "../mcp-executor";
import { verifyAuth } from "../middleware/auth";
import {
  getN8NCommunityTools,
  getN8NCommunityResources,
  getN8NCommunityPrompts,
} from "../n8n/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional authentication (if API keys configured)
  const authResult = await verifyAuth(request);
  if (!authResult.allowed && process.env.MCP_BRIDGE_API_KEY) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Unauthorized",
          data: { hint: "Add header: Authorization: Bearer <your-api-key>" },
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const enabledServers = Object.values(MCP_SERVERS).filter(
        (s) => s.enabled
      );

      // Get n8n tools dynamically
      const n8nServer = enabledServers.find((s) => s.name === "n8n");
      let n8nTools: any[] = [];
      let n8nResources: any[] = [];
      let n8nPrompts: any[] = [];

      if (n8nServer) {
        try {
          n8nTools = await getN8NCommunityTools();
          n8nResources = await getN8NCommunityResources();
          n8nPrompts = await getN8NCommunityPrompts();
        } catch (error) {
          console.error("[sse] Failed to load n8n tools:", error);
        }
      }

      // Calculate totals including dynamic n8n tools
      const staticToolsCount = enabledServers.reduce(
        (sum, s) => sum + (s.name === "n8n" ? 0 : s.tools.length),
        0
      );
      const totalTools = staticToolsCount + n8nTools.length;
      const staticResourcesCount = enabledServers.reduce(
        (sum, s) => sum + (s.name === "n8n" ? 0 : s.resources?.length || 0),
        0
      );
      const totalResources = staticResourcesCount + n8nResources.length;
      const staticPromptsCount = enabledServers.reduce(
        (sum, s) => sum + (s.name === "n8n" ? 0 : s.prompts?.length || 0),
        0
      );
      const totalPrompts = staticPromptsCount + n8nPrompts.length;

      // MCP Protocol: Send server info
      const serversWithSampling = enabledServers.filter(
        (s) => s.supportsSampling
      );
      send("message", {
        jsonrpc: "2.0",
        id: "server-info",
        method: "server/info",
        params: {
          name: "MMC-MCP-Bridge",
          version: "2.0.0",
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
            sampling: serversWithSampling.length > 0 ? {} : undefined,
          },
          serverInfo: {
            totalServers: Object.keys(MCP_SERVERS).length,
            enabledServers: enabledServers.length,
            servers: enabledServers.map((s) => s.name),
            totalTools: totalTools,
            totalResources: totalResources,
            totalPrompts: totalPrompts,
          },
        },
      });

      // MCP Protocol: List tools (including dynamic n8n tools)
      const allTools = enabledServers.flatMap((s) => {
        if (s.name === "n8n") {
          // Use dynamic n8n tools
          return n8nTools.map((t: any) => ({
            name: `n8n_${t.name}`,
            description: `[n8n] ${t.description || t.name}`,
            inputSchema: t.inputSchema || { type: "object", properties: {} },
          }));
        }
        // Use static tools for other servers
        return s.tools.map((t) => ({
          name: `${s.name}_${t.name}`,
          description: `[${s.name}] ${t.description}`,
          inputSchema: t.inputSchema,
        }));
      });

      send("message", {
        jsonrpc: "2.0",
        id: "tools-list",
        method: "tools/list",
        params: {
          tools: allTools,
        },
      });

      // MCP Protocol: List resources (including dynamic n8n resources)
      const allResources = enabledServers.flatMap((s) => {
        if (s.name === "n8n") {
          // Use dynamic n8n resources
          return n8nResources.map((r: any) => ({
            uri: r.uri || `n8n://${r.name?.toLowerCase().replace(/\s+/g, "-")}`,
            name: `[n8n] ${r.name || "Resource"}`,
            description: r.description || r.name || "",
            mimeType: r.mimeType || "application/json",
          }));
        }
        // Use static resources for other servers
        return (s.resources || []).map((r) => ({
          uri: r.uri,
          name: `[${s.name}] ${r.name}`,
          description: r.description,
          mimeType: "application/json",
        }));
      });

      send("message", {
        jsonrpc: "2.0",
        id: "resources-list",
        method: "resources/list",
        params: {
          resources: allResources,
        },
      });

      // MCP Protocol: List prompts (including dynamic n8n prompts)
      const allPrompts = enabledServers.flatMap((s) => {
        if (s.name === "n8n") {
          // Combine static n8n prompts with dynamic ones
          const staticPrompts = (s.prompts || []).map((p) => ({
            name: `n8n_${p.name}`,
            description: `[n8n] ${p.description}`,
            arguments: p.arguments || [],
          }));
          const dynamicPrompts = n8nPrompts.map((p: any) => ({
            name: `n8n_${p.name || "prompt"}`,
            description: `[n8n] ${p.description || p.name || ""}`,
            arguments: p.arguments || [],
          }));
          return [...staticPrompts, ...dynamicPrompts];
        }
        // Use static prompts for other servers
        return (s.prompts || []).map((p) => ({
          name: `${s.name}_${p.name}`,
          description: `[${s.name}] ${p.description}`,
          arguments: p.arguments || [],
        }));
      });

      send("message", {
        jsonrpc: "2.0",
        id: "prompts-list",
        method: "prompts/list",
        params: {
          prompts: allPrompts,
        },
      });

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          send("ping", { timestamp: new Date().toISOString() });
        } catch (error) {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// MCP Protocol: Handle tool invocations, resource reads, prompt gets via POST
export async function POST(request: Request) {
  // Optional authentication (if API keys configured)
  const authResult = await verifyAuth(request);
  if (!authResult.allowed && process.env.MCP_BRIDGE_API_KEY) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: "Unauthorized",
          data: { hint: "Add header: Authorization: Bearer <your-api-key>" },
        },
      },
      { status: 401 }
    );
  }

  let requestId: any = null;

  try {
    const body = await request.json();
    requestId = body.id || null; // Capture id for error responses

    if (body.jsonrpc !== "2.0") {
      return Response.json(
        {
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
        },
        { status: 400 }
      );
    }

    const method = body.method;

    // MCP Protocol: tools/call
    if (method === "tools/call") {
      const { name, arguments: args } = body.params || {};

      if (!name) {
        return Response.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: "Invalid params: tool name required",
            },
          },
          { status: 400 }
        );
      }

      // Parse tool name: "server_tool"
      const [serverName, toolName] = name.split("_", 2);
      const server = MCP_SERVERS[serverName];

      if (!server || !server.enabled) {
        return Response.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32602,
            message: `Server not found or disabled: ${serverName}`,
          },
        });
      }

      // For n8n, tools are loaded dynamically, so skip static tool validation
      if (serverName !== "n8n") {
        const tool = server.tools.find((t) => t.name === toolName);
        if (!tool) {
          return Response.json({
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: `Tool not found: ${toolName} in server ${serverName}`,
            },
          });
        }
      } else {
        // For n8n, validate tool exists dynamically
        try {
          const n8nTools = await getN8NCommunityTools();
          const toolExists = n8nTools.some((t: any) => t.name === toolName);
          if (!toolExists) {
            return Response.json({
              jsonrpc: "2.0",
              id: requestId,
              error: {
                code: -32602,
                message: `Tool not found: ${toolName} in n8n server`,
              },
            });
          }
        } catch (error: any) {
          return Response.json({
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32603,
              message: `Failed to validate n8n tool: ${error.message}`,
            },
          });
        }
      }

      // Use centralized executor with real SDK implementations
      const result = await executeMCPTool(serverName, toolName, args || {});

      return Response.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        },
      });
    }

    // MCP Protocol: resources/read
    if (method === "resources/read") {
      const { uri } = body.params || {};

      if (!uri) {
        return Response.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: "Invalid params: resource uri required",
            },
          },
          { status: 400 }
        );
      }

      // Find resource by URI
      const enabledServers = Object.values(MCP_SERVERS).filter(
        (s) => s.enabled
      );
      for (const server of enabledServers) {
        const resource = (server.resources || []).find((r) => r.uri === uri);
        if (resource) {
          // Return resource metadata (actual content would come from server-specific implementation)
          return Response.json({
            jsonrpc: "2.0",
            id: requestId,
            result: {
              contents: [
                {
                  uri: resource.uri,
                  mimeType: "application/json",
                  text: JSON.stringify(
                    {
                      name: resource.name,
                      description: resource.description,
                      server: server.name,
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          });
        }
      }

      return Response.json({
        jsonrpc: "2.0",
        id: requestId,
        error: { code: -32602, message: `Resource not found: ${uri}` },
      });
    }

    // MCP Protocol: prompts/get
    if (method === "prompts/get") {
      const { name, arguments: promptArgs } = body.params || {};

      if (!name) {
        return Response.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: "Invalid params: prompt name required",
            },
          },
          { status: 400 }
        );
      }

      // Parse prompt name: "server_prompt"
      const [serverName, promptName] = name.split("_", 2);
      const server = MCP_SERVERS[serverName];

      if (!server || !server.enabled) {
        return Response.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32602,
            message: `Server not found or disabled: ${serverName}`,
          },
        });
      }

      const prompt = (server.prompts || []).find((p) => p.name === promptName);
      if (!prompt) {
        return Response.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32602,
            message: `Prompt not found: ${promptName} in server ${serverName}`,
          },
        });
      }

      // Return prompt with arguments filled in
      return Response.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          description: prompt.description,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `[${serverName}] ${prompt.description}${
                  promptArgs
                    ? "\n\nArguments: " + JSON.stringify(promptArgs, null, 2)
                    : ""
                }`,
              },
            },
          ],
        },
      });
    }

    // Unknown method
    return Response.json(
      {
        jsonrpc: "2.0",
        id: requestId,
        error: { code: -32601, message: `Method not found: ${method}` },
      },
      { status: 404 }
    );
  } catch (error: any) {
    // JSON-RPC 2.0: Always include id in error response when available
    return Response.json(
      {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32603,
          message: error.message || "Internal error",
          data: {
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          },
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
