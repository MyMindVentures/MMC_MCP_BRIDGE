import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

let redis: Redis | null = null;
let taskQueue: Queue | null = null;

function getQueue() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || '', {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true
    });
    
    redis.connect().catch(err => {
      console.error('Redis connection failed:', err.message);
    });
  }
  
  if (!taskQueue) {
    taskQueue = new Queue('agentic-tasks', { connection: redis });
  }
  
  return taskQueue;
}

export async function POST(request: Request) {
  try {
    const { instruction, context } = await request.json();
    
    if (!instruction) {
      return NextResponse.json(
        { error: 'instruction required' },
        { status: 400 }
      );
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json(
        { error: 'Redis not configured. Set REDIS_URL environment variable.' },
        { status: 503 }
      );
    }

    const queue = getQueue();
    const job = await queue.add('agent-task', { instruction, context });
    
    return NextResponse.json({ 
      jobId: job.id, 
      status: 'queued' 
    });
  } catch (error: any) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to queue agent task' },
      { status: 500 }
    );
  }
}

