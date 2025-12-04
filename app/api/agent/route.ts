// app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { submitAgentTask } from '@/app/api/agent-worker';

// Define valid agent task types
const VALID_AGENT_TYPES = ['tool_execution', 'workflow', 'analysis'] as const;
type AgentTaskType = typeof VALID_AGENT_TYPES[number];

// Type guard function
function isValidAgentType(type: unknown): type is AgentTaskType {
  return typeof type === 'string' && 
         VALID_AGENT_TYPES.includes(type as AgentTaskType);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, instruction, steps, context } = body;

    // Validate type parameter
    if (!isValidAgentType(type)) {
      return NextResponse.json(
        { 
          error: 'Invalid task type',
          message: `Type must be one of: ${VALID_AGENT_TYPES.join(', ')}`,
          received: type
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!instruction) {
      return NextResponse.json(
        { error: 'Missing required field: instruction' },
        { status: 400 }
      );
    }

    // Now type is properly typed as AgentTaskType
    const jobId = await submitAgentTask({
      type,
      description: instruction,
      steps: steps || [],
      context: context || {}
    });

    return NextResponse.json({ 
      success: true,
      jobId,
      message: 'Agent task submitted successfully'
    });

  } catch (error) {
    console.error('Agent task error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit agent task',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
