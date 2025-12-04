// Get task status from Agentic Worker
// GET /api/agent/status/:jobId

import { NextResponse } from 'next/server';
import { getTaskStatus } from '../../queue';

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    
    const status = await getTaskStatus(jobId);

    if (!status) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}






