// Docker Tool Implementations - Docker CLI via exec
// 25+ tools for complete Docker container and infrastructure management
// Uses Docker CLI commands (Docker-in-Docker compatible)

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Helper to execute Docker CLI commands
async function dockerExec(command: string): Promise<any> {
  try {
    const { stdout, stderr } = await execAsync(`docker ${command}`);
    if (stderr && !stderr.includes("WARNING")) {
      throw new Error(stderr);
    }
    return stdout.trim();
  } catch (error: any) {
    throw new Error(`Docker command failed: ${error.message}`);
  }
}

// Helper to parse JSON output
async function dockerJSON(command: string): Promise<any> {
  const output = await dockerExec(`${command} --format '{{json .}}'`);
  try {
    return JSON.parse(output);
  } catch {
    // If single object, try parsing as array
    const lines = output.split("\n").filter(Boolean);
    return lines.map((line: string) => {
      try {
        return JSON.parse(line);
      } catch {
        return line;
      }
    });
  }
}

// Main executor function
export async function executeDockerTool(
  tool: string,
  params: any,
): Promise<any> {
  try {
    switch (tool) {
      // ========== CONTAINERS ==========
      case "listContainers": {
        const all = params.all ? "-a" : "";
        const output = await dockerExec(`ps ${all} --format '{{json .}}'`);
        const lines = output.split("\n").filter(Boolean);
        return lines.map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
      }

      case "getContainer": {
        const inspect = await dockerExec(`inspect ${params.id}`);
        try {
          return JSON.parse(inspect);
        } catch {
          return { raw: inspect };
        }
      }

      case "createContainer": {
        // Extract image and other config from params.config
        const config = params.config;
        const image = config.Image || config.image;
        if (!image) throw new Error("Image required in config");

        const name = config.name ? `--name ${config.name}` : "";
        const env = config.Env
          ? config.Env.map((e: string) => `-e "${e}"`).join(" ")
          : "";
        const ports = config.ExposedPorts
          ? Object.keys(config.ExposedPorts)
              .map((p: string) => `-p ${p}`)
              .join(" ")
          : "";

        const result = await dockerExec(
          `create ${name} ${env} ${ports} ${image}`,
        );
        return { id: result.trim(), success: true };
      }

      case "startContainer":
        await dockerExec(`start ${params.id}`);
        return { success: true, id: params.id };

      case "stopContainer": {
        const timeout = params.timeout ? `-t ${params.timeout}` : "";
        await dockerExec(`stop ${timeout} ${params.id}`);
        return { success: true, id: params.id };
      }

      case "restartContainer": {
        const timeout = params.timeout ? `-t ${params.timeout}` : "";
        await dockerExec(`restart ${timeout} ${params.id}`);
        return { success: true, id: params.id };
      }

      case "removeContainer": {
        const force = params.force ? "-f" : "";
        await dockerExec(`rm ${force} ${params.id}`);
        return { success: true, id: params.id };
      }

      case "getContainerLogs": {
        const tail = params.tail ? `--tail ${params.tail}` : "";
        const logs = await dockerExec(`logs ${tail} ${params.id}`);
        return { logs: logs.split("\n") };
      }

      case "execContainer": {
        const command = params.command.join(" ");
        const result = await dockerExec(`exec ${params.id} ${command}`);
        return { output: result, success: true };
      }

      // ========== IMAGES ==========
      case "listImages": {
        const all = params.all ? "-a" : "";
        const output = await dockerExec(`images ${all} --format '{{json .}}'`);
        const lines = output.split("\n").filter(Boolean);
        return lines.map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
      }

      case "getImage": {
        const inspect = await dockerExec(`inspect ${params.name}`);
        try {
          return JSON.parse(inspect);
        } catch {
          return { raw: inspect };
        }
      }

      case "pullImage":
        await dockerExec(`pull ${params.name}`);
        return { success: true, name: params.name };

      case "buildImage": {
        // Note: tarContext would need to be handled differently
        // For now, assume context is current directory
        const tag = params.tag ? `-t ${params.tag}` : "";
        const result = await dockerExec(`build ${tag} .`);
        return { success: true, output: result };
      }

      case "removeImage": {
        const force = params.force ? "-f" : "";
        await dockerExec(`rmi ${force} ${params.name}`);
        return { success: true, name: params.name };
      }

      // ========== NETWORKS ==========
      case "listNetworks": {
        const output = await dockerExec(`network ls --format '{{json .}}'`);
        const lines = output.split("\n").filter(Boolean);
        return lines.map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
      }

      case "getNetwork": {
        const inspect = await dockerExec(`network inspect ${params.id}`);
        try {
          return JSON.parse(inspect);
        } catch {
          return { raw: inspect };
        }
      }

      case "createNetwork": {
        const config = params.config;
        const name = config.name || config.Name;
        if (!name) throw new Error("Network name required");

        const driver = config.driver ? `--driver ${config.driver}` : "";
        const result = await dockerExec(`network create ${driver} ${name}`);
        return { success: true, id: result.trim() };
      }

      case "removeNetwork":
        await dockerExec(`network rm ${params.id}`);
        return { success: true, id: params.id };

      // ========== VOLUMES ==========
      case "listVolumes": {
        const output = await dockerExec(`volume ls --format '{{json .}}'`);
        const lines = output.split("\n").filter(Boolean);
        return lines.map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
      }

      case "getVolume": {
        const inspect = await dockerExec(`volume inspect ${params.name}`);
        try {
          return JSON.parse(inspect);
        } catch {
          return { raw: inspect };
        }
      }

      case "createVolume": {
        const config = params.config;
        const name = config.name || config.Name;
        if (!name) throw new Error("Volume name required");

        const driver = config.driver ? `--driver ${config.driver}` : "";
        const result = await dockerExec(`volume create ${driver} ${name}`);
        return { success: true, name: result.trim() };
      }

      case "removeVolume":
        await dockerExec(`volume rm ${params.name}`);
        return { success: true, name: params.name };

      // ========== SYSTEM ==========
      case "systemInfo": {
        const info = await dockerExec(`info --format '{{json .}}'`);
        try {
          return JSON.parse(info);
        } catch {
          return { raw: info };
        }
      }

      case "systemPrune": {
        const all = params.all ? "-a" : "";
        const volumes = params.volumes ? "--volumes" : "";
        const result = await dockerExec(`system prune -f ${all} ${volumes}`);
        return { success: true, output: result };
      }

      case "version": {
        const version = await dockerExec(`version --format '{{json .}}'`);
        try {
          return JSON.parse(version);
        } catch {
          return { raw: version };
        }
      }

      default:
        throw new Error(`Unknown Docker tool: ${tool}`);
    }
  } catch (error: any) {
    throw new Error(`Docker tool execution failed: ${error.message}`);
  }
}
