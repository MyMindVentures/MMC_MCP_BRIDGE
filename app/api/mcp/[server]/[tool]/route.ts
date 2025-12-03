// MCP Tool Execution endpoint
// POST /api/mcp/:server/:tool

import { NextResponse } from 'next/server';
import { MCP_SERVERS } from '../../../mcp-config';

export async function POST(
  request: Request,
  context: { params: Promise<{ server: string; tool: string }> }
) {
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

    const result = server.execute
      ? await server.execute(toolName, body)
      : { message: `${serverName}.${toolName} executed`, params: body };

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

