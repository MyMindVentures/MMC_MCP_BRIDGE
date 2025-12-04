// GitHub Tool Implementations - FULL SDK
// 25+ tools with complete @octokit/rest support

import { Octokit } from "@octokit/rest";

let octokit: Octokit | null = null;

function getClient(): Octokit {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured");
  }
  if (!octokit) {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  return octokit;
}

// REPOSITORY OPERATIONS
export async function listRepos(owner?: string, limit: number = 30): Promise<any> {
  const client = getClient();
  const { data } = owner
    ? await client.repos.listForUser({ username: owner, per_page: limit })
    : await client.repos.listForAuthenticatedUser({ per_page: limit });
  return data;
}

export async function getRepo(owner: string, repo: string): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.get({ owner, repo });
  return data;
}

export async function createRepo(data: { name: string; description?: string; private?: boolean }): Promise<any> {
  const client = getClient();
  const { data: repo } = await client.repos.createForAuthenticatedUser(data);
  return repo;
}

export async function updateRepo(owner: string, repo: string, data: any): Promise<any> {
  const client = getClient();
  const { data: updated } = await client.repos.update({ owner, repo, ...data });
  return updated;
}

export async function deleteRepo(owner: string, repo: string): Promise<any> {
  const client = getClient();
  await client.repos.delete({ owner, repo });
  return { success: true, message: `Repository ${owner}/${repo} deleted` };
}

// ISSUE OPERATIONS
export async function listIssues(owner: string, repo: string, state: string = "open"): Promise<any> {
  const client = getClient();
  const { data } = await client.issues.listForRepo({ owner, repo, state: state as any });
  return data;
}

export async function getIssue(owner: string, repo: string, issue_number: number): Promise<any> {
  const client = getClient();
  const { data } = await client.issues.get({ owner, repo, issue_number });
  return data;
}

export async function createIssue(owner: string, repo: string, title: string, body?: string, labels?: string[]): Promise<any> {
  const client = getClient();
  const { data } = await client.issues.create({ owner, repo, title, body, labels });
  return data;
}

export async function updateIssue(owner: string, repo: string, issue_number: number, data: any): Promise<any> {
  const client = getClient();
  const { data: updated } = await client.issues.update({ owner, repo, issue_number, ...data });
  return updated;
}

export async function closeIssue(owner: string, repo: string, issue_number: number): Promise<any> {
  const client = getClient();
  const { data } = await client.issues.update({ owner, repo, issue_number, state: "closed" });
  return data;
}

// PULL REQUEST OPERATIONS
export async function listPRs(owner: string, repo: string, state: string = "open"): Promise<any> {
  const client = getClient();
  const { data } = await client.pulls.list({ owner, repo, state: state as any });
  return data;
}

export async function getPR(owner: string, repo: string, pull_number: number): Promise<any> {
  const client = getClient();
  const { data } = await client.pulls.get({ owner, repo, pull_number });
  return data;
}

export async function createPR(owner: string, repo: string, title: string, head: string, base: string, body?: string): Promise<any> {
  const client = getClient();
  const { data } = await client.pulls.create({ owner, repo, title, head, base, body });
  return data;
}

export async function mergePR(owner: string, repo: string, pull_number: number, merge_method?: string): Promise<any> {
  const client = getClient();
  const { data } = await client.pulls.merge({ 
    owner, 
    repo, 
    pull_number, 
    merge_method: (merge_method as any) || "merge" 
  });
  return data;
}

export async function reviewPR(owner: string, repo: string, pull_number: number, event: string, body?: string): Promise<any> {
  const client = getClient();
  const { data } = await client.pulls.createReview({ 
    owner, 
    repo, 
    pull_number, 
    event: event as any,
    body 
  });
  return data;
}

// WORKFLOW OPERATIONS
export async function listWorkflows(owner: string, repo: string): Promise<any> {
  const client = getClient();
  const { data } = await client.actions.listRepoWorkflows({ owner, repo });
  return data.workflows;
}

export async function getWorkflow(owner: string, repo: string, workflow_id: number): Promise<any> {
  const client = getClient();
  const { data } = await client.actions.getWorkflow({ owner, repo, workflow_id });
  return data;
}

export async function triggerWorkflow(owner: string, repo: string, workflow_id: number, ref: string, inputs?: any): Promise<any> {
  const client = getClient();
  await client.actions.createWorkflowDispatch({ owner, repo, workflow_id, ref, inputs });
  return { success: true, message: "Workflow triggered" };
}

export async function listWorkflowRuns(owner: string, repo: string, workflow_id?: number): Promise<any> {
  const client = getClient();
  const params: any = { owner, repo };
  if (workflow_id) params.workflow_id = workflow_id;
  const { data } = await client.actions.listWorkflowRuns(params);
  return data.workflow_runs;
}

export async function getWorkflowRun(owner: string, repo: string, run_id: number): Promise<any> {
  const client = getClient();
  const { data } = await client.actions.getWorkflowRun({ owner, repo, run_id });
  return data;
}

// RELEASE OPERATIONS
export async function listReleases(owner: string, repo: string): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.listReleases({ owner, repo });
  return data;
}

export async function getRelease(owner: string, repo: string, release_id: number): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.getRelease({ owner, repo, release_id });
  return data;
}

export async function createRelease(owner: string, repo: string, tag_name: string, name?: string, body?: string): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.createRelease({ owner, repo, tag_name, name, body });
  return data;
}

export async function updateRelease(owner: string, repo: string, release_id: number, data: any): Promise<any> {
  const client = getClient();
  const { data: updated } = await client.repos.updateRelease({ owner, repo, release_id, ...data });
  return updated;
}

export async function deleteRelease(owner: string, repo: string, release_id: number): Promise<any> {
  const client = getClient();
  await client.repos.deleteRelease({ owner, repo, release_id });
  return { success: true, message: "Release deleted" };
}

// BRANCH OPERATIONS
export async function listBranches(owner: string, repo: string): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.listBranches({ owner, repo });
  return data;
}

export async function getBranch(owner: string, repo: string, branch: string): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.getBranch({ owner, repo, branch });
  return data;
}

export async function createBranch(owner: string, repo: string, branch: string, sha: string): Promise<any> {
  const client = getClient();
  const { data } = await client.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha });
  return data;
}

export async function deleteBranch(owner: string, repo: string, branch: string): Promise<any> {
  const client = getClient();
  await client.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
  return { success: true, message: `Branch ${branch} deleted` };
}

// COMMIT OPERATIONS
export async function listCommits(owner: string, repo: string, sha?: string, path?: string): Promise<any> {
  const client = getClient();
  const params: any = { owner, repo };
  if (sha) params.sha = sha;
  if (path) params.path = path;
  const { data } = await client.repos.listCommits(params);
  return data;
}

export async function getCommit(owner: string, repo: string, ref: string): Promise<any> {
  const client = getClient();
  const { data } = await client.repos.getCommit({ owner, repo, ref });
  return data;
}

// SEARCH OPERATIONS
export async function searchCode(query: string): Promise<any> {
  const client = getClient();
  const { data } = await client.search.code({ q: query });
  return data.items;
}

export async function searchRepos(query: string): Promise<any> {
  const client = getClient();
  const { data } = await client.search.repos({ q: query });
  return data.items;
}

export async function searchIssues(query: string): Promise<any> {
  const client = getClient();
  const { data } = await client.search.issuesAndPullRequests({ q: query });
  return data.items;
}

// MAIN EXECUTOR
export async function executeGitHubTool(tool: string, params: any): Promise<any> {
  try {
    switch (tool) {
      // Repository Operations
      case "listRepos":
        return await listRepos(params.owner, params.limit);
      case "getRepo":
        return await getRepo(params.owner, params.repo);
      case "createRepo":
        return await createRepo(params);
      case "updateRepo":
        return await updateRepo(params.owner, params.repo, params.data);
      case "deleteRepo":
        return await deleteRepo(params.owner, params.repo);

      // Issue Operations
      case "listIssues":
        return await listIssues(params.owner, params.repo, params.state);
      case "getIssue":
        return await getIssue(params.owner, params.repo, params.issue_number);
      case "createIssue":
        return await createIssue(params.owner, params.repo, params.title, params.body, params.labels);
      case "updateIssue":
        return await updateIssue(params.owner, params.repo, params.issue_number, params.data);
      case "closeIssue":
        return await closeIssue(params.owner, params.repo, params.issue_number);

      // Pull Request Operations
      case "listPRs":
        return await listPRs(params.owner, params.repo, params.state);
      case "getPR":
        return await getPR(params.owner, params.repo, params.pull_number);
      case "createPR":
        return await createPR(params.owner, params.repo, params.title, params.head, params.base, params.body);
      case "mergePR":
        return await mergePR(params.owner, params.repo, params.pull_number, params.merge_method);
      case "reviewPR":
        return await reviewPR(params.owner, params.repo, params.pull_number, params.event, params.body);

      // Workflow Operations
      case "listWorkflows":
        return await listWorkflows(params.owner, params.repo);
      case "getWorkflow":
        return await getWorkflow(params.owner, params.repo, params.workflow_id);
      case "triggerWorkflow":
        return await triggerWorkflow(params.owner, params.repo, params.workflow_id, params.ref, params.inputs);
      case "listWorkflowRuns":
        return await listWorkflowRuns(params.owner, params.repo, params.workflow_id);
      case "getWorkflowRun":
        return await getWorkflowRun(params.owner, params.repo, params.run_id);

      // Release Operations
      case "listReleases":
        return await listReleases(params.owner, params.repo);
      case "getRelease":
        return await getRelease(params.owner, params.repo, params.release_id);
      case "createRelease":
        return await createRelease(params.owner, params.repo, params.tag_name, params.name, params.body);
      case "updateRelease":
        return await updateRelease(params.owner, params.repo, params.release_id, params.data);
      case "deleteRelease":
        return await deleteRelease(params.owner, params.repo, params.release_id);

      // Branch Operations
      case "listBranches":
        return await listBranches(params.owner, params.repo);
      case "getBranch":
        return await getBranch(params.owner, params.repo, params.branch);
      case "createBranch":
        return await createBranch(params.owner, params.repo, params.branch, params.sha);
      case "deleteBranch":
        return await deleteBranch(params.owner, params.repo, params.branch);

      // Commit Operations
      case "listCommits":
        return await listCommits(params.owner, params.repo, params.sha, params.path);
      case "getCommit":
        return await getCommit(params.owner, params.repo, params.ref);

      // Search Operations
      case "searchCode":
        return await searchCode(params.query);
      case "searchRepos":
        return await searchRepos(params.query);
      case "searchIssues":
        return await searchIssues(params.query);

      default:
        throw new Error(`Unknown github tool: ${tool}`);
    }
  } catch (error: any) {
    throw new Error(`GitHub tool '${tool}' failed: ${error.message}`);
  }
}


