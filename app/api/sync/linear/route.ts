// Linear Sync API - Bidirectional sync between Tasklist.prd and Linear issues
// Syncs todos from Tasklist.prd to Linear issues and vice versa

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { executeLinearTool } from "../../linear-tools";

const TASKLIST_PATH = join(process.cwd(), "Tasklist.prd");

// Parse Tasklist.prd line format: [STATUS] feat-id: Description
function parseTasklistLine(line: string) {
  const match = line.match(/^([✅🔄⏳])\s*(feat-[^:]+):\s*(.+)$/);
  if (!match) return null;

  const [, status, featId, description] = match;
  return {
    status:
      status === "✅"
        ? "completed"
        : status === "🔄"
          ? "in_progress"
          : "pending",
    featId: featId.trim(),
    description: description.trim(),
    fullLine: line.trim(),
  };
}

// Map Tasklist status to Linear state
function mapStatusToLinearState(status: string): string {
  switch (status) {
    case "completed":
      return "Done";
    case "in_progress":
      return "In Progress";
    case "pending":
      return "Todo";
    default:
      return "Todo";
  }
}

// Map Linear state to Tasklist status
function mapLinearStateToStatus(state: string): string {
  switch (state?.toLowerCase()) {
    case "done":
    case "completed":
      return "✅";
    case "in progress":
    case "inprogress":
      return "🔄";
    case "todo":
    case "backlog":
      return "⏳";
    default:
      return "⏳";
  }
}

// Read and parse Tasklist.prd
async function readTasklist() {
  try {
    const content = await fs.readFile(TASKLIST_PATH, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    const todos = lines.map(parseTasklistLine).filter(Boolean);
    return todos;
  } catch (error) {
    console.error("[Linear Sync] Failed to read Tasklist.prd:", error);
    return [];
  }
}

// Find Linear team ID (first team)
async function getLinearTeamId(): Promise<string | null> {
  try {
    const teams = await executeLinearTool("listTeams", {});
    if (teams && teams.length > 0) {
      return teams[0].id;
    }
    return null;
  } catch (error) {
    console.error("[Linear Sync] Failed to get team:", error);
    return null;
  }
}

// Get Linear state ID by state name (workaround: use state name in updateIssue)
// Note: Linear SDK updateIssue accepts stateId or state name, but we'll use the existing state from the issue
async function getStateIdForState(
  teamId: string,
  stateName: string,
): Promise<string | null> {
  try {
    // Get issues to find state IDs (workaround)
    const issues = await executeLinearTool("listIssues", {
      filter: { team: { id: { eq: teamId } } },
    });

    // Find an issue with the target state to get the state ID
    const issueWithState = issues.find(
      (issue: any) => issue.state?.name === stateName,
    );

    return issueWithState?.state?.id || null;
  } catch (error) {
    console.error("[Linear Sync] Failed to get state ID:", error);
    return null;
  }
}

// Sync Tasklist.prd → Linear (create/update issues)
export async function POST(request: NextRequest) {
  try {
    const { direction = "tasklist-to-linear" } = await request
      .json()
      .catch(() => ({}));

    if (direction === "tasklist-to-linear") {
      // Read Tasklist.prd
      const todos = await readTasklist();
      if (todos.length === 0) {
        return NextResponse.json(
          { error: "No todos found in Tasklist.prd" },
          { status: 400 },
        );
      }

      // Get Linear team
      const teamId = await getLinearTeamId();
      if (!teamId) {
        return NextResponse.json(
          { error: "No Linear team found" },
          { status: 400 },
        );
      }

      // Get existing issues
      const existingIssues = await executeLinearTool("listIssues", {
        filter: { team: { id: { eq: teamId } } },
      });
      const issueMap = new Map();
      existingIssues.forEach((issue: any) => {
        const featIdMatch = issue.title?.match(/feat-[^:]+/);
        if (featIdMatch) {
          issueMap.set(featIdMatch[0], issue);
        }
      });

      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        issues: [] as any[],
      };

      // Sync each todo
      for (const todo of todos) {
        if (!todo) continue;

        const existingIssue = issueMap.get(todo.featId);
        const linearState = mapStatusToLinearState(todo.status);
        const title = `${todo.featId}: ${todo.description}`;

        if (existingIssue) {
          // Update existing issue
          const currentStateName = existingIssue.state?.name || "";
          const needsUpdate =
            currentStateName !== linearState || existingIssue.title !== title;

          if (needsUpdate) {
            // Get state ID for the target state
            const stateId = await getStateIdForState(teamId, linearState);

            const updateData: any = { title };
            if (stateId) {
              updateData.stateId = stateId;
            } else {
              // Fallback: try using state name (some Linear SDK versions support this)
              console.warn(
                `[Linear Sync] State ID not found for "${linearState}", using state name`,
              );
            }

            await executeLinearTool("updateIssue", {
              issueId: existingIssue.id,
              data: updateData,
            });
            results.updated++;
          } else {
            results.skipped++;
          }
          results.issues.push({
            featId: todo.featId,
            linearId: existingIssue.id,
            action: "updated",
          });
        } else {
          // Create new issue
          const newIssue = await executeLinearTool("createIssue", {
            teamId,
            title,
            description: `Synced from Tasklist.prd\n\nStatus: ${todo.status}\nFeature ID: ${todo.featId}`,
            priority: todo.status === "in_progress" ? 2 : 3,
          });
          results.created++;
          results.issues.push({
            featId: todo.featId,
            linearId: newIssue.id,
            action: "created",
          });
        }
      }

      return NextResponse.json({
        success: true,
        direction: "tasklist-to-linear",
        results,
      });
    } else if (direction === "linear-to-tasklist") {
      // Sync Linear → Tasklist.prd
      const teamId = await getLinearTeamId();
      if (!teamId) {
        return NextResponse.json(
          { error: "No Linear team found" },
          { status: 400 },
        );
      }

      const issues = await executeLinearTool("listIssues", {
        filter: { team: { id: { eq: teamId } } },
      });
      const todos = await readTasklist();
      const tasklistMap = new Map(todos.map((t: any) => [t?.featId, t]));

      const updates: string[] = [];
      let updated = 0;

      // Read current Tasklist.prd
      const currentContent = await fs.readFile(TASKLIST_PATH, "utf-8");
      const lines = currentContent.split("\n");

      // Update lines based on Linear issues
      for (const line of lines) {
        const todo = parseTasklistLine(line);
        if (!todo) {
          updates.push(line);
          continue;
        }

        // Find matching Linear issue
        const matchingIssue = issues.find((issue: any) => {
          const featIdMatch = issue.title?.match(/feat-[^:]+/);
          return featIdMatch && featIdMatch[0] === todo.featId;
        });

        if (matchingIssue) {
          const newStatus = mapLinearStateToStatus(
            matchingIssue.state?.name || "Todo",
          );
          if (newStatus !== todo.status) {
            const newLine = `${newStatus} ${todo.featId}: ${todo.description}`;
            updates.push(newLine);
            updated++;
          } else {
            updates.push(line);
          }
        } else {
          updates.push(line);
        }
      }

      // Write updated Tasklist.prd
      await fs.writeFile(TASKLIST_PATH, updates.join("\n") + "\n", "utf-8");

      return NextResponse.json({
        success: true,
        direction: "linear-to-tasklist",
        updated,
        totalIssues: issues.length,
      });
    }

    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  } catch (error: any) {
    console.error("[Linear Sync] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get sync status
export async function GET() {
  try {
    const todos = await readTasklist();
    const teamId = await getLinearTeamId();

    if (!teamId) {
      return NextResponse.json({
        tasklist: { count: todos.length },
        linear: { connected: false },
      });
    }

    const issues = await executeLinearTool("listIssues", {
      filter: { team: { id: { eq: teamId } } },
    });

    // Match todos with issues
    const matched = todos.filter((todo: any) => {
      if (!todo) return false;
      return issues.some((issue: any) => {
        const featIdMatch = issue.title?.match(/feat-[^:]+/);
        return featIdMatch && featIdMatch[0] === todo.featId;
      });
    });

    return NextResponse.json({
      tasklist: {
        count: todos.length,
        completed: todos.filter((t: any) => t?.status === "completed").length,
        in_progress: todos.filter((t: any) => t?.status === "in_progress")
          .length,
        pending: todos.filter((t: any) => t?.status === "pending").length,
      },
      linear: {
        connected: true,
        teamId,
        issuesCount: issues.length,
        matchedCount: matched.length,
      },
      sync: {
        synced: matched.length,
        unsynced: todos.length - matched.length,
      },
    });
  } catch (error: any) {
    console.error("[Linear Sync] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
