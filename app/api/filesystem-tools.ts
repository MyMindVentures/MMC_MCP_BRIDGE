// Filesystem Tools - Command Execution
import { exec } from "child_process";
import { promisify } from "util";
import { pathToFileURL } from "url";
import * as path from "path";

const execAsync = promisify(exec);

export async function executeCommand(params: {
  command: string;
  cwd?: string;
  timeout?: number;
}): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}> {
  const { command, cwd, timeout = 30000 } = params;

  // Security: Only allow safe commands in production
  const safeCommands = [
    "npm",
    "node",
    "npx",
    "docker",
    "docker-compose",
    "git",
    "doppler",
    "dagger",
    "bash",
    "sh",
    "pwsh",
    "powershell",
    "./",
    "cd",
    "ls",
    "cat",
    "grep",
    "find",
    "which",
    "echo",
  ];

  const commandBase = command.trim().split(/\s+/)[0];
  const isSafe =
    safeCommands.some((safe) => commandBase.startsWith(safe)) ||
    commandBase.startsWith("./") ||
    commandBase.startsWith("/");

  if (!isSafe) {
    throw new Error(
      `Command not allowed: ${commandBase}. Only safe commands are allowed.`,
    );
  }

  try {
    // Determine working directory
    const workingDir = cwd
      ? path.resolve(cwd)
      : process.cwd() || "/workspaces/MMC_MCP_BRIDGE";

    // Execute command with timeout
    const { stdout, stderr } = (await Promise.race([
      execAsync(command, {
        cwd: workingDir,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        env: {
          ...process.env,
          PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Command timeout")), timeout),
      ),
    ])) as { stdout: string; stderr: string };

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      success: true,
    };
  } catch (error: any) {
    // execAsync throws on non-zero exit codes
    return {
      stdout: error.stdout?.trim() || "",
      stderr: error.stderr?.trim() || error.message || "",
      exitCode: error.code || 1,
      success: false,
    };
  }
}
