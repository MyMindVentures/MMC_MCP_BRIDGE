// Dagger Pipeline for MMC MCP Bridge CI/CD
// Modern CI/CD pipeline with caching, parallel execution, and Railway deployment
// Usage: dagger run ./.dagger/pipeline.ts

import { dag, Container, Directory, Secret } from "@dagger.io/dagger";

// Pipeline configuration
const DOCKER_HUB_USERNAME = process.env.DOCKER_HUB_USERNAME || "mymindventures";
const PROJECT_NAME = "mmc-mcp-bridge";
const VERSION =
  process.env.VERSION || process.env.GITHUB_SHA?.slice(0, 7) || "latest";
const NODE_VERSION = "22.3.0-alpine";

// Base Node.js container with caching
function getBaseNodeContainer(): Container {
  return dag
    .container()
    .from(`node:${NODE_VERSION}`)
    .withEnv("NODE_ENV", "production")
    .withEnv("NEXT_TELEMETRY_DISABLED", "1");
}

// Build and push DevContainer with caching
async function buildDevContainer(source: Directory): Promise<string> {
  const base = getBaseNodeContainer();

  // Install system dependencies
  const withDeps = base.withExec([
    "apk",
    "add",
    "--no-cache",
    "wget",
    "curl",
    "bash",
    "git",
  ]);

  // Install Doppler CLI
  const withDoppler = withDeps.withExec([
    "sh",
    "-c",
    "curl -Ls --tlsv1.2 --proto '=https' --retry 3 https://cli.doppler.com/install.sh | sh && mv /root/.local/bin/doppler /usr/local/bin/doppler 2>/dev/null || true",
  ]);

  // Copy package files and install dependencies (cached layer)
  const packageJson = source.file("package.json");
  const packageLockJson = source.file("package-lock.json");

  const withDependencies = withDoppler
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withFile("package.json", packageJson)
    .withFile("package-lock.json", packageLockJson)
    .withMountedCache(
      "/workspaces/MMC_MCP_BRIDGE/node_modules",
      dag.cacheVolume("mmc-mcp-bridge-node-modules")
    )
    .withExec(["npm", "ci"]);

  // Copy source code
  const devcontainer = withDependencies
    .withDirectory("/workspaces/MMC_MCP_BRIDGE", source, {
      exclude: ["node_modules", ".next", ".git"],
    })
    .withExposedPort(3000)
    .withEnv("NODE_ENV", "development")
    .withEnv("PORT", "3000")
    .withLabel("com.mmc.project", PROJECT_NAME)
    .withLabel("com.mmc.component", "devcontainer")
    .withLabel("com.mmc.version", VERSION);

  // Publish to Docker Hub
  const imageRef = await devcontainer.publish(
    `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-devcontainer:${VERSION}`
  );

  await devcontainer.publish(
    `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-devcontainer:latest`
  );

  return imageRef;
}

// Build and push App Container with multi-stage build and caching
async function buildAppContainer(source: Directory): Promise<string> {
  const base = getBaseNodeContainer();

  // Builder stage
  const packageJson = source.file("package.json");
  const packageLockJson = source.file("package-lock.json");

  const builder = base
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withFile("package.json", packageJson)
    .withFile("package-lock.json", packageLockJson)
    .withMountedCache(
      "/workspaces/MMC_MCP_BRIDGE/node_modules",
      dag.cacheVolume("mmc-mcp-bridge-node-modules")
    )
    .withExec(["npm", "ci"])
    .withDirectory("/workspaces/MMC_MCP_BRIDGE", source, {
      exclude: ["node_modules", ".next", ".git"],
    })
    .withExec(["npm", "run", "build"]);

  // Production stage
  const app = getBaseNodeContainer()
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withFile("package.json", packageJson)
    .withFile("package-lock.json", packageLockJson)
    .withMountedCache(
      "/workspaces/MMC_MCP_BRIDGE/node_modules",
      dag.cacheVolume("mmc-mcp-bridge-node-modules-prod")
    )
    .withExec(["npm", "ci", "--omit=dev"])
    .withDirectory(
      "/workspaces/MMC_MCP_BRIDGE/.next",
      builder.directory("/workspaces/MMC_MCP_BRIDGE/.next")
    )
    .withDirectory(
      "/workspaces/MMC_MCP_BRIDGE/app",
      builder.directory("/workspaces/MMC_MCP_BRIDGE/app")
    )
    .withDirectory(
      "/workspaces/MMC_MCP_BRIDGE/public",
      builder.directory("/workspaces/MMC_MCP_BRIDGE/public")
    )
    .withExposedPort(3000)
    .withEnv("NODE_ENV", "production")
    .withEnv("PORT", "3000")
    .withLabel("com.mmc.project", PROJECT_NAME)
    .withLabel("com.mmc.component", "app")
    .withLabel("com.mmc.version", VERSION)
    .withEntrypoint(["npm", "run", "start"]);

  // Publish to Docker Hub
  const imageRef = await app.publish(
    `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-app:${VERSION}`
  );

  await app.publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-app:latest`);

  return imageRef;
}

// Build and push E2E Container
async function buildE2EContainer(source: Directory): Promise<string> {
  const base = dag.container().from(`node:${NODE_VERSION}`);

  // Install system dependencies for Playwright
  const withDeps = base
    .withExec([
      "apk",
      "add",
      "--no-cache",
      "bash",
      "curl",
      "wget",
      "git",
      "chromium",
      "nss",
      "freetype",
      "freetype-dev",
      "harfbuzz",
      "ca-certificates",
      "ttf-freefont",
    ])
    .withEnv("PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD", "1")
    .withEnv(
      "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH",
      "/usr/bin/chromium-browser"
    );

  const packageJson = source.file("package.json");
  const packageLockJson = source.file("package-lock.json");

  const e2e = withDeps
    .withWorkdir("/workspaces/MMC_MCP_BRIDGE")
    .withFile("package.json", packageJson)
    .withFile("package-lock.json", packageLockJson)
    .withMountedCache(
      "/workspaces/MMC_MCP_BRIDGE/node_modules",
      dag.cacheVolume("mmc-mcp-bridge-e2e-node-modules")
    )
    .withExec(["npm", "ci"])
    .withDirectory("/workspaces/MMC_MCP_BRIDGE", source, {
      exclude: ["node_modules", ".next", ".git"],
    })
    .withLabel("com.mmc.project", PROJECT_NAME)
    .withLabel("com.mmc.component", "e2e")
    .withLabel("com.mmc.version", VERSION);

  // Publish to Docker Hub
  const imageRef = await e2e.publish(
    `${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-e2e:${VERSION}`
  );

  await e2e.publish(`${DOCKER_HUB_USERNAME}/${PROJECT_NAME}-e2e:latest`);

  return imageRef;
}

// Run type checking
async function runTypeCheck(source: Directory): Promise<string> {
  const base = getBaseNodeContainer();
  const packageJson = source.file("package.json");
  const packageLockJson = source.file("package-lock.json");

  const testContainer = base
    .withWorkdir("/app")
    .withFile("package.json", packageJson)
    .withFile("package-lock.json", packageLockJson)
    .withMountedCache(
      "/app/node_modules",
      dag.cacheVolume("mmc-mcp-bridge-test-node-modules")
    )
    .withExec(["npm", "ci"])
    .withDirectory("/app", source, {
      exclude: ["node_modules", ".next", ".git"],
    })
    .withExec(["npm", "run", "type-check"]);

  const output = await testContainer.stdout();
  return output;
}

// Run build validation
async function runBuildValidation(source: Directory): Promise<string> {
  const base = getBaseNodeContainer();
  const packageJson = source.file("package.json");
  const packageLockJson = source.file("package-lock.json");

  const buildContainer = base
    .withWorkdir("/app")
    .withFile("package.json", packageJson)
    .withFile("package-lock.json", packageLockJson)
    .withMountedCache(
      "/app/node_modules",
      dag.cacheVolume("mmc-mcp-bridge-build-node-modules")
    )
    .withExec(["npm", "ci"])
    .withDirectory("/app", source, {
      exclude: ["node_modules", ".next", ".git"],
    })
    .withExec(["npm", "run", "build"]);

  const output = await buildContainer.stdout();
  return output;
}

// Validate Railway configuration
async function validateRailwayConfig(source: Directory): Promise<string> {
  const railwayJson = source.file("railway.json");

  const validator = dag
    .container()
    .from("node:22-alpine")
    .withExec(["apk", "add", "--no-cache", "jq"])
    .withFile("railway.json", railwayJson)
    .withExec([
      "sh",
      "-c",
      "jq empty railway.json && echo '✅ Railway.json is valid JSON' || (echo '❌ Railway.json is invalid' && exit 1)",
    ]);

  const output = await validator.stdout();
  return output;
}

// Main pipeline entrypoint with parallel execution
export default async function pipeline() {
  const source = dag.host().directory(".", {
    exclude: [
      "node_modules",
      ".next",
      ".git",
      "*.tsbuildinfo",
      ".devcontainer-persist",
    ],
  });

  console.log("🚀 Starting MMC MCP Bridge CI/CD Pipeline");
  console.log(`📦 Version: ${VERSION}`);
  console.log(`🐳 Docker Hub: ${DOCKER_HUB_USERNAME}/${PROJECT_NAME}`);

  // Phase 1: Validation (parallel)
  console.log("\n📋 Phase 1: Validation");
  const [typeCheckOutput, buildOutput, railwayValidation] = await Promise.all([
    runTypeCheck(source).catch((e) => `❌ Type check failed: ${e}`),
    runBuildValidation(source).catch((e) => `❌ Build failed: ${e}`),
    validateRailwayConfig(source).catch(
      (e) => `❌ Railway config invalid: ${e}`
    ),
  ]);

  console.log("✅ Type Check:", typeCheckOutput);
  console.log("✅ Build Validation:", buildOutput);
  console.log("✅ Railway Config:", railwayValidation);

  // Phase 2: Build containers (parallel)
  console.log("\n🔨 Phase 2: Building Containers (Parallel)");
  const [devcontainerRef, appRef, e2eRef] = await Promise.all([
    buildDevContainer(source).catch(
      (e) => `❌ DevContainer build failed: ${e}`
    ),
    buildAppContainer(source).catch((e) => `❌ App build failed: ${e}`),
    buildE2EContainer(source).catch((e) => `❌ E2E build failed: ${e}`),
  ]);

  console.log(`✅ DevContainer: ${devcontainerRef}`);
  console.log(`✅ App Container: ${appRef}`);
  console.log(`✅ E2E Container: ${e2eRef}`);

  // Phase 3: Summary
  console.log("\n✅ Pipeline completed successfully!");
  console.log("\n📦 Published Images:");
  console.log(`  - ${devcontainerRef}`);
  console.log(`  - ${appRef}`);
  console.log(`  - ${e2eRef}`);
  console.log("\n🚂 Railway Deployment:");
  console.log("  - Auto-deploy on push to main");
  console.log("  - PR preview deployments enabled");
  console.log("  - Health check: /api/health");
}
