// Git Tool Implementations - FULL SDK
// 15+ tools with complete simple-git support

import simpleGit, { SimpleGit } from "simple-git";

function getGit(path?: string): SimpleGit {
  return simpleGit(path || process.cwd());
}

// BASIC OPERATIONS
export async function clone(url: string, path: string): Promise<any> {
  const git = getGit();
  await git.clone(url, path);
  return { success: true, url, path };
}

export async function commit(
  message: string,
  files?: string[],
  path?: string,
): Promise<any> {
  const git = getGit(path);
  if (files && files.length > 0) {
    await git.add(files);
  }
  const result = await git.commit(message);
  return result;
}

export async function push(
  remote: string = "origin",
  branch: string = "main",
  path?: string,
): Promise<any> {
  const git = getGit(path);
  const result = await git.push(remote, branch);
  return result;
}

export async function pull(
  remote: string = "origin",
  branch: string = "main",
  path?: string,
): Promise<any> {
  const git = getGit(path);
  const result = await git.pull(remote, branch);
  return result;
}

export async function status(path?: string): Promise<any> {
  const git = getGit(path);
  return await git.status();
}

export async function log(limit: number = 10, path?: string): Promise<any> {
  const git = getGit(path);
  return await git.log({ maxCount: limit });
}

// BRANCH OPERATIONS
export async function branch(
  action: string,
  name?: string,
  path?: string,
): Promise<any> {
  const git = getGit(path);

  switch (action) {
    case "list":
      return await git.branch();
    case "create":
      if (!name) throw new Error("Branch name required for create");
      return await git.checkoutLocalBranch(name);
    case "delete":
      if (!name) throw new Error("Branch name required for delete");
      return await git.deleteLocalBranch(name);
    case "switch":
    case "checkout":
      if (!name) throw new Error("Branch name required for checkout");
      return await git.checkout(name);
    default:
      throw new Error(`Unknown branch action: ${action}`);
  }
}

// DIFF OPERATIONS
export async function diff(
  options?: { staged?: boolean; file?: string },
  path?: string,
): Promise<any> {
  const git = getGit(path);

  if (options?.staged) {
    return await git.diff(["--cached", options.file || ""]);
  } else if (options?.file) {
    return await git.diff([options.file]);
  } else {
    return await git.diff();
  }
}

export async function diffSummary(path?: string): Promise<any> {
  const git = getGit(path);
  return await git.diffSummary();
}

// STASH OPERATIONS
export async function stash(action: string, path?: string): Promise<any> {
  const git = getGit(path);

  switch (action) {
    case "save":
    case "push":
      return await git.stash();
    case "pop":
      return await git.stash(["pop"]);
    case "list":
      return await git.stashList();
    case "clear":
      return await git.stash(["clear"]);
    case "drop":
      return await git.stash(["drop"]);
    default:
      throw new Error(`Unknown stash action: ${action}`);
  }
}

// TAG OPERATIONS
export async function tag(
  action: string,
  name?: string,
  message?: string,
  path?: string,
): Promise<any> {
  const git = getGit(path);

  switch (action) {
    case "list":
      return await git.tags();
    case "create":
      if (!name) throw new Error("Tag name required");
      if (message) {
        return await git.addAnnotatedTag(name, message);
      } else {
        return await git.addTag(name);
      }
    case "delete":
      if (!name) throw new Error("Tag name required");
      return await git.tag(["-d", name]);
    default:
      throw new Error(`Unknown tag action: ${action}`);
  }
}

// REMOTE OPERATIONS
export async function remote(
  action: string,
  name?: string,
  url?: string,
  path?: string,
): Promise<any> {
  const git = getGit(path);

  switch (action) {
    case "list":
      return await git.getRemotes(true);
    case "add":
      if (!name || !url) throw new Error("Remote name and URL required");
      return await git.addRemote(name, url);
    case "remove":
      if (!name) throw new Error("Remote name required");
      return await git.removeRemote(name);
    case "get-url":
      if (!name) throw new Error("Remote name required");
      return await git.remote(["get-url", name]);
    default:
      throw new Error(`Unknown remote action: ${action}`);
  }
}

// MERGE OPERATIONS
export async function merge(
  branch: string,
  options?: { noFf?: boolean; squash?: boolean },
  path?: string,
): Promise<any> {
  const git = getGit(path);
  const args: string[] = [branch];

  if (options?.noFf) args.unshift("--no-ff");
  if (options?.squash) args.unshift("--squash");

  return await git.merge(args);
}

// REBASE OPERATIONS
export async function rebase(branch: string, path?: string): Promise<any> {
  const git = getGit(path);
  return await git.rebase([branch]);
}

// RESET OPERATIONS
export async function reset(
  mode: string = "mixed",
  commit: string = "HEAD",
  path?: string,
): Promise<any> {
  const git = getGit(path);
  const modeFlag =
    mode === "hard" ? "--hard" : mode === "soft" ? "--soft" : "--mixed";
  return await git.reset([modeFlag, commit]);
}

// BLAME OPERATIONS
export async function blame(file: string, path?: string): Promise<any> {
  const git = getGit(path);
  const result = await git.raw(["blame", file]);
  return { file, blame: result };
}

// SHOW OPERATIONS
export async function show(commit: string, path?: string): Promise<any> {
  const git = getGit(path);
  return await git.show([commit]);
}

// MAIN EXECUTOR
export async function executeGitTool(tool: string, params: any): Promise<any> {
  try {
    switch (tool) {
      // Basic Operations
      case "clone":
        return await clone(params.url, params.path);
      case "commit":
        return await commit(params.message, params.files, params.path);
      case "push":
        return await push(params.remote, params.branch, params.path);
      case "pull":
        return await pull(params.remote, params.branch, params.path);
      case "status":
        return await status(params.path);
      case "log":
        return await log(params.limit, params.path);

      // Branch Operations
      case "branch":
        return await branch(params.action, params.name, params.path);

      // Diff Operations
      case "diff":
        return await diff(params.options, params.path);
      case "diffSummary":
        return await diffSummary(params.path);

      // Stash Operations
      case "stash":
        return await stash(params.action, params.path);

      // Tag Operations
      case "tag":
        return await tag(
          params.action,
          params.name,
          params.message,
          params.path,
        );

      // Remote Operations
      case "remote":
        return await remote(
          params.action,
          params.name,
          params.url,
          params.path,
        );

      // Merge & Rebase
      case "merge":
        return await merge(params.branch, params.options, params.path);
      case "rebase":
        return await rebase(params.branch, params.path);

      // Reset
      case "reset":
        return await reset(params.mode, params.commit, params.path);

      // Advanced
      case "blame":
        return await blame(params.file, params.path);
      case "show":
        return await show(params.commit, params.path);

      default:
        throw new Error(`Unknown git tool: ${tool}`);
    }
  } catch (error: any) {
    throw new Error(`Git tool '${tool}' failed: ${error.message}`);
  }
}
