// MCP Tool Execution endpoint
// POST /api/mcp/:server/:tool

import { NextResponse } from 'next/server';
import { MCP_SERVERS } from '../../../mcp-config';
import { executeMCPTool } from '../../../mcp-executor';
import { verifyAuth, authErrorResponse } from '../../../middleware/auth';

export async function POST(
  request: Request,
  context: { params: Promise<{ server: string; tool: string }> }
) {
  // 🔐 Authentication check
  const authResult = await verifyAuth(request);
  if (!authResult.allowed) {
    return authErrorResponse(authResult.reason || 'Unauthorized', 401, authResult.rateLimit);
  }
  
  try {
    const { server: serverName, tool: toolName } = await context.params;
    const server = MCP_SERVERS[serverName];

    if (!server || !server.enabled) {
      return NextResponse.json(
        { error: 'Server not found or disabled' },
        { status: 404 }
      );
    }

    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate tool input schema if available
    if (tool.inputSchema && tool.inputSchema.required) {
      const missing = tool.inputSchema.required.filter((field: string) => !(field in body));
      if (missing.length > 0) {
        return NextResponse.json(
          { 
            error: 'Missing required parameters',
            missing: missing,
            schema: tool.inputSchema
          },
          { status: 400 }
        );
      }
    }

    // Use centralized executor with real SDK implementations
    const result = await executeMCPTool(serverName, toolName, body);

    // Add rate limit headers to response
    const headers: Record<string, string> = {};
    if (authResult.rateLimit) {
      headers['X-RateLimit-Limit'] = authResult.rateLimit.limit.toString();
      headers['X-RateLimit-Remaining'] = authResult.rateLimit.remaining.toString();
      headers['X-RateLimit-Reset'] = authResult.rateLimit.reset.toString();
    }

    return NextResponse.json({ 
      success: true, 
      result,
      server: serverName,
      tool: toolName
    }, { headers });
  } catch (error: any) {
    // Enhanced error handling
    const statusCode = error.message?.includes('not configured') ? 503 
                     : error.message?.includes('not found') ? 404
                     : error.message?.includes('Invalid') ? 400
                     : 500;
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        server: (await context.params).server,
        tool: (await context.params).tool,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

