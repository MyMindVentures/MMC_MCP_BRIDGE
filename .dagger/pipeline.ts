// Dagger Pipeline for MMC MCP Bridge CI/CD
// Builds, tests, and deploys all containers to Docker Hub and Railway

import { dag, Container, Directory } from "@dagger.io/dagger";

// Pipeline configuration
const DOCKER_HUB_USERNAME = process.env.DOCKER_HUB_USERNAME || "mymindventures";
const PROJECT_NAME = "mmc-mcp-bridge";
const VERSION = process.env.VERSION || "2.0.0";

// Build and push DevContainer
async function buildDevContainer(source: Directory): Promise<string> {
  const devcontainer = dag
    .container()
    .from("mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye")
    .withDirectory("/workspaces/MMC_MCP_BRIDGE", source)
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withExec(["npm", "ci"]);

  const imageRef = await devcontainer
    .publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-devcontainer:${VERSION}`);

  await devcontainer
    .publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-devcontainer:latest`);

  return imageRef;
}

// Build and push App Container
async function buildAppContainer(source: Directory): Promise<string> {
  const app = dag
    .container()
    .from("mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye")
    .withDirectory("/workspaces/MMC_MCP_BRIDGE", source)
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withExec(["npm", "ci"])
    .withExec(["npm", "run", "build"])
    .withExposedPort(3000)
    .withEnv("NODE_ENV", "production")
    .withEnv("PORT", "3000")
    .withEntrypoint(["npm", "run", "start"]);

  const imageRef = await app
    .publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-app:${VERSION}`);

  await app
    .publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-app:latest`);

  return imageRef;
}

// Build and push E2E Container
async function buildE2EContainer(source: Directory): Promise<string> {
  const e2e = dag
    .container()
    .from("mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye")
    .withDirectory("/workspaces/MMC_MCP_BRIDGE", source)
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withExec(["npm", "ci"])
    .withExec(["npm", "install", "-g", "@dagger.io/dagger"]);

  const imageRef = await e2e
    .publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-e2e:${VERSION}`);

  await e2e
    .publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-e2e:latest`);

  return imageRef;
}

// Run tests
async function runTests(source: Directory): Promise<string> {
  const testContainer = dag
    .container()
    .from("node:20")
    .withDirectory("/app", source)
    .withWorkdir("/app")
    .withExec(["npm", "ci"])
    .withExec(["npm", "run", "type-check"]);

  const output = await testContainer.stdout();
  return output;
}

// Main pipeline entrypoint
export default async function pipeline() {
  const source = dag.host().directory(".", {
    exclude: ["node_modules", ".next", ".git", "*.tsbuildinfo"],
  });

  console.log("🔨 Building DevContainer...");
  const devcontainerRef = await buildDevContainer(source);
  console.log(`✅ DevContainer: ${devcontainerRef}`);

  console.log("🔨 Building App Container...");
  const appRef = await buildAppContainer(source);
  console.log(`✅ App Container: ${appRef}`);

  console.log("🔨 Building E2E Container...");
  const e2eRef = await buildE2EContainer(source);
  console.log(`✅ E2E Container: ${e2eRef}`);

  console.log("🧪 Running tests...");
  const testOutput = await runTests(source);
  console.log(testOutput);

  console.log("✅ Pipeline completed!");
  console.log(`📦 Images published:`);
  console.log(`  - ${devcontainerRef}`);
  console.log(`  - ${appRef}`);
  console.log(`  - ${e2eRef}`);
}

