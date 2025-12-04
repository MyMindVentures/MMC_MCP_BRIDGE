// Submit task to Agentic Worker
// POST /api/agent/submit

import { NextResponse } from 'next/server';
import { submitAgentTask } from '../queue';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { type, description, steps, context } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const jobId = await submitAgentTask({
      type: type || 'workflow',
      description,
      steps: steps || [],
      context: context || {}
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Task submitted to agent queue'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}







