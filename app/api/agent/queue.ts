// Agentic Worker Queue - BullMQ powered autonomous task execution
// This agent can execute complete tasklists across all 25 MCP servers

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { executeMCPTool } from '../mcp-executor';
import OpenAI from 'openai';

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Task types
export interface AgentTask {
  id: string;
  type: 'tool_execution' | 'workflow' | 'analysis';
  description: string;
  steps: TaskStep[];
  context?: Record<string, any>;
}

export interface TaskStep {
  server: string;
  tool: string;
  params: any;
  description: string;
}

export interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed' | 'partial';
  results: StepResult[];
  summary: string;
  duration: number;
}

export interface StepResult {
  step: number;
  server: string;
  tool: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

// Agent Queue
export const agentQueue = new Queue('mmc-agent-tasks', { connection });

// AI-powered task planner
async function planTask(description: string): Promise<TaskStep[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY required for AI task planning');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an AI task planner for an MCP orchestration platform with 25 servers:
git, filesystem, playwright, n8n, mongodb, linear, railway, github, openai, anthropic, 
postgres, sqlite, notion, slack, airtable, doppler, raindrop, postman, google-drive, 
ollama, brave-search, puppeteer, sentry, strapi, stripe.

Break down user tasks into executable steps using these servers. Return JSON array of steps:
[{"server": "...", "tool": "...", "params": {...}, "description": "..."}]`
      },
      {
        role: 'user',
        content: description
      }
    ],
    temperature: 0.3
  });

  const content = completion.choices[0].message.content || '[]';
  return JSON.parse(content);
}

// Agent Worker - Executes tasks autonomously
export const agentWorker = new Worker<AgentTask, TaskResult>(
  'mmc-agent-tasks',
  async (job: Job<AgentTask>) => {
    const startTime = Date.now();
    const results: StepResult[] = [];

    console.log(`[Agent] Starting task: ${job.data.id} - ${job.data.description}`);

    // If no steps provided, use AI to plan
    let steps = job.data.steps;
    if (!steps || steps.length === 0) {
      console.log('[Agent] No steps provided, using AI planner...');
      steps = await planTask(job.data.description);
    }

    // Execute each step sequentially
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepStart = Date.now();

      try {
        console.log(`[Agent] Step ${i + 1}/${steps.length}: ${step.description}`);
        
        // Update job progress
        await job.updateProgress((i / steps.length) * 100);

        // Execute the tool
        const result = await executeMCPTool(step.server, step.tool, step.params);

        results.push({
          step: i + 1,
          server: step.server,
          tool: step.tool,
          success: true,
          result,
          duration: Date.now() - stepStart
        });

        console.log(`[Agent] Step ${i + 1} completed in ${Date.now() - stepStart}ms`);
      } catch (error: any) {
        console.error(`[Agent] Step ${i + 1} failed:`, error.message);
        
        results.push({
          step: i + 1,
          server: step.server,
          tool: step.tool,
          success: false,
          error: error.message,
          duration: Date.now() - stepStart
        });

        // Decide whether to continue or abort
        if (step.params?.critical !== false) {
          console.log('[Agent] Critical step failed, aborting task');
          break;
        }
      }
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const status = successCount === steps.length ? 'completed' 
                 : successCount === 0 ? 'failed' 
                 : 'partial';

    const summary = `Task ${status}: ${successCount}/${steps.length} steps completed in ${duration}ms`;
    console.log(`[Agent] ${summary}`);

    return {
      taskId: job.data.id,
      status,
      results,
      summary,
      duration
    };
  },
  { connection }
);

// Event handlers
agentWorker.on('completed', (job, result) => {
  console.log(`[Agent] Task ${job.id} completed:`, result.summary);
});

agentWorker.on('failed', (job, error) => {
  console.error(`[Agent] Task ${job?.id} failed:`, error.message);
});

agentWorker.on('error', (error) => {
  console.error('[Agent] Worker error:', error);
});

// Helper: Submit task to queue
export async function submitAgentTask(task: Omit<AgentTask, 'id'>): Promise<string> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const job = await agentQueue.add('execute-task', {
    ...task,
    id: taskId
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });

  return job.id as string;
}

// Helper: Get task status
export async function getTaskStatus(jobId: string): Promise<any> {
  const job = await agentQueue.getJob(jobId);
  if (!job) return null;

  return {
    id: job.id,
    state: await job.getState(),
    progress: job.progress,
    result: job.returnvalue,
    failedReason: job.failedReason,
    timestamp: job.timestamp
  };
}

console.log('[Agent] Worker initialized and ready');



