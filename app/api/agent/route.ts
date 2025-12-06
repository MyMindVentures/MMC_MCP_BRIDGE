// app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { submitAgentTask } from "./queue";

// Define valid agent task types
const VALID_AGENT_TYPES = ["tool_execution", "workflow", "analysis"] as const;
type AgentTaskType = (typeof VALID_AGENT_TYPES)[number];

// Type guard function
function isValidAgentType(type: unknown): type is AgentTaskType {
  return (
    typeof type === "string" &&
    VALID_AGENT_TYPES.includes(type as AgentTaskType)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, instruction, steps, context } = body;

    // Validate required fields
    if (!instruction) {
      return NextResponse.json(
        { error: "Missing required field: instruction" },
        { status: 400 }
      );
    }

    // Default type to 'tool_execution' if not provided (backward compatibility)
    const taskType: AgentTaskType =
      type && isValidAgentType(type) ? type : "tool_execution";

    // Now type is properly typed as AgentTaskType
    const jobId = await submitAgentTask({
      type: taskType,
      description: instruction,
      steps: steps || [],
      context: context || {},
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: "Agent task submitted successfully",
      pollUrl: `/api/agent/status/${jobId}`,
    });
  } catch (error) {
    console.error("Agent task error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit agent task",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
