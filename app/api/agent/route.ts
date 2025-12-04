import { NextResponse } from 'next/server';
import { submitAgentTask } from './queue';

// High-level Agent endpoint used by the UI (/api/agent)
// This wraps the lower-level /api/agent/submit + BullMQ queue
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const instruction = body.instruction as string | undefined;
    const steps = body.steps ?? [];
    const context = body.context ?? {};
    const type = (body.type as string | undefined) ?? 'workflow';

    if (!instruction || !instruction.trim()) {
      return NextResponse.json(
        { error: 'instruction is required' },
        { status: 400 }
      );
    }

    const jobId = await submitAgentTask({
      type,
      description: instruction,
      steps,
      context
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Agent task submitted',
      pollUrl: `/api/agent/status/${jobId}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}


