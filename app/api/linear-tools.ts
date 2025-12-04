// Linear Tool Implementations - FULL SDK
// 20+ tools with complete @linear/sdk support

import { LinearClient } from "@linear/sdk";

let linearClient: LinearClient | null = null;

function getClient(): LinearClient {
  if (!process.env.LINEAR_API_KEY) {
    throw new Error("LINEAR_API_KEY not configured");
  }
  if (!linearClient) {
    linearClient = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
  }
  return linearClient;
}

// ISSUE OPERATIONS
export async function listIssues(filter?: any): Promise<any> {
  const client = getClient();
  const issues = await client.issues(filter);
  return await issues.nodes;
}

export async function getIssue(issueId: string): Promise<any> {
  const client = getClient();
  return await client.issue(issueId);
}

export async function createIssue(data: {
  teamId: string;
  title: string;
  description?: string;
  priority?: number;
  assigneeId?: string;
  labelIds?: string[];
  projectId?: string;
  cycleId?: string;
  estimate?: number;
}): Promise<any> {
  const client = getClient();
  const payload = await client.createIssue(data);
  return payload.issue;
}

export async function updateIssue(issueId: string, data: any): Promise<any> {
  const client = getClient();
  return await client.updateIssue(issueId, data);
}

export async function deleteIssue(issueId: string): Promise<any> {
  const client = getClient();
  return await client.deleteIssue(issueId);
}

export async function searchIssues(query: string): Promise<any> {
  const client = getClient();
  return await client.searchIssues(query);
}

// COMMENT OPERATIONS
export async function createComment(issueId: string, body: string): Promise<any> {
  const client = getClient();
  const payload = await client.createComment({ issueId, body });
  return payload.comment;
}

export async function listComments(issueId: string): Promise<any> {
  const client = getClient();
  const issue = await client.issue(issueId);
  const comments = await issue.comments();
  return await comments.nodes;
}

export async function updateComment(commentId: string, body: string): Promise<any> {
  const client = getClient();
  return await client.updateComment(commentId, { body });
}

export async function deleteComment(commentId: string): Promise<any> {
  const client = getClient();
  return await client.deleteComment(commentId);
}

// PROJECT OPERATIONS
export async function listProjects(teamId?: string): Promise<any> {
  const client = getClient();
  const projects = teamId 
    ? await client.team(teamId).then(t => t.projects())
    : await client.projects();
  return await projects.nodes;
}

export async function getProject(projectId: string): Promise<any> {
  const client = getClient();
  return await client.project(projectId);
}

export async function createProject(data: {
  name: string;
  description?: string;
  teamIds: string[];
  leadId?: string;
  targetDate?: string;
}): Promise<any> {
  const client = getClient();
  const payload = await client.createProject(data);
  return payload.project;
}

export async function updateProject(projectId: string, data: any): Promise<any> {
  const client = getClient();
  return await client.updateProject(projectId, data);
}

export async function deleteProject(projectId: string): Promise<any> {
  const client = getClient();
  return await client.deleteProject(projectId);
}

// CYCLE OPERATIONS
export async function listCycles(teamId: string): Promise<any> {
  const client = getClient();
  const team = await client.team(teamId);
  const cycles = await team.cycles();
  return await cycles.nodes;
}

export async function getCycle(cycleId: string): Promise<any> {
  const client = getClient();
  return await client.cycle(cycleId);
}

export async function createCycle(data: {
  teamId: string;
  name: string;
  startsAt: string;
  endsAt: string;
}): Promise<any> {
  const client = getClient();
  const payload = await client.createCycle(data);
  return payload.cycle;
}

export async function updateCycle(cycleId: string, data: any): Promise<any> {
  const client = getClient();
  return await client.updateCycle(cycleId, data);
}

// LABEL OPERATIONS
export async function listLabels(teamId?: string): Promise<any> {
  const client = getClient();
  const labels = teamId
    ? await client.team(teamId).then(t => t.labels())
    : await client.issueLabels();
  return await labels.nodes;
}

export async function createLabel(data: {
  name: string;
  color?: string;
  description?: string;
  teamId?: string;
}): Promise<any> {
  const client = getClient();
  const payload = await client.createIssueLabel(data);
  return payload.issueLabel;
}

export async function updateLabel(labelId: string, data: any): Promise<any> {
  const client = getClient();
  return await client.updateIssueLabel(labelId, data);
}

export async function deleteLabel(labelId: string): Promise<any> {
  const client = getClient();
  return await client.deleteIssueLabel(labelId);
}

// TEAM OPERATIONS
export async function listTeams(): Promise<any> {
  const client = getClient();
  const teams = await client.teams();
  return await teams.nodes;
}

export async function getTeam(teamId: string): Promise<any> {
  const client = getClient();
  return await client.team(teamId);
}

// USER OPERATIONS
export async function listUsers(): Promise<any> {
  const client = getClient();
  const users = await client.users();
  return await users.nodes;
}

export async function getUser(userId: string): Promise<any> {
  const client = getClient();
  return await client.user(userId);
}

export async function getViewer(): Promise<any> {
  const client = getClient();
  return await client.viewer;
}

// ATTACHMENT OPERATIONS
export async function createAttachment(data: {
  issueId: string;
  title: string;
  url: string;
}): Promise<any> {
  const client = getClient();
  const payload = await client.createAttachment(data);
  return payload.attachment;
}

export async function listAttachments(issueId: string): Promise<any> {
  const client = getClient();
  const issue = await client.issue(issueId);
  const attachments = await issue.attachments();
  return await attachments.nodes;
}

export async function deleteAttachment(attachmentId: string): Promise<any> {
  const client = getClient();
  return await client.deleteAttachment(attachmentId);
}

// BULK OPERATIONS
export async function bulkUpdateIssues(issueIds: string[], data: any): Promise<any> {
  const client = getClient();
  const results = await Promise.all(
    issueIds.map(id => client.updateIssue(id, data))
  );
  return { updated: results.length, results };
}

// MAIN EXECUTOR
export async function executeLinearTool(tool: string, params: any): Promise<any> {
  try {
    switch (tool) {
      // Issue Operations
      case "listIssues":
        return await listIssues(params.filter);
      case "getIssue":
        return await getIssue(params.issueId);
      case "createIssue":
        return await createIssue(params);
      case "updateIssue":
        return await updateIssue(params.issueId, params.data);
      case "deleteIssue":
        return await deleteIssue(params.issueId);
      case "searchIssues":
        return await searchIssues(params.query);

      // Comment Operations
      case "createComment":
        return await createComment(params.issueId, params.body);
      case "listComments":
        return await listComments(params.issueId);
      case "updateComment":
        return await updateComment(params.commentId, params.body);
      case "deleteComment":
        return await deleteComment(params.commentId);

      // Project Operations
      case "listProjects":
        return await listProjects(params.teamId);
      case "getProject":
        return await getProject(params.projectId);
      case "createProject":
        return await createProject(params);
      case "updateProject":
        return await updateProject(params.projectId, params.data);
      case "deleteProject":
        return await deleteProject(params.projectId);

      // Cycle Operations
      case "listCycles":
        return await listCycles(params.teamId);
      case "getCycle":
        return await getCycle(params.cycleId);
      case "createCycle":
        return await createCycle(params);
      case "updateCycle":
        return await updateCycle(params.cycleId, params.data);

      // Label Operations
      case "listLabels":
        return await listLabels(params.teamId);
      case "createLabel":
        return await createLabel(params);
      case "updateLabel":
        return await updateLabel(params.labelId, params.data);
      case "deleteLabel":
        return await deleteLabel(params.labelId);

      // Team Operations
      case "listTeams":
        return await listTeams();
      case "getTeam":
        return await getTeam(params.teamId);

      // User Operations
      case "listUsers":
        return await listUsers();
      case "getUser":
        return await getUser(params.userId);
      case "getViewer":
        return await getViewer();

      // Attachment Operations
      case "createAttachment":
        return await createAttachment(params);
      case "listAttachments":
        return await listAttachments(params.issueId);
      case "deleteAttachment":
        return await deleteAttachment(params.attachmentId);

      // Bulk Operations
      case "bulkUpdateIssues":
        return await bulkUpdateIssues(params.issueIds, params.data);

      default:
        throw new Error(`Unknown linear tool: ${tool}`);
    }
  } catch (error: any) {
    throw new Error(`Linear tool '${tool}' failed: ${error.message}`);
  }
}



