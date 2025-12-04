# 🐳 Local Docker Development Setup

## Quick Start

```bash
# Start local development container with hot reload
npm run docker:dev:build

# Or use the helper script
./.devcontainer/start-local-dev.sh
```

## Available Commands

```bash
# Start container (REUSES existing container/image - no rebuild)
npm run docker:dev

# Build image (only if Dockerfile changed) and start
npm run docker:dev:build

# View logs (with follow)
npm run docker:dev:logs

# Stop container (keeps container and image)
npm run docker:dev:stop

# Remove container (keeps image)
npm run docker:dev:down

# Restart container
npm run docker:dev:restart

# Clean up unused Docker resources (keeps dev container)
npm run docker:dev:cleanup

# Full cleanup (removes everything including dev container)
npm run docker:dev:clean
```

## Container Reuse Strategy

**The setup is optimized to REUSE the same container and image:**

1. **First run**: Builds image and creates container
2. **Subsequent runs**: Reuses existing container (no rebuild)
3. **Code changes**: Hot reload via volume mounts (no restart needed)
4. **Dockerfile changes**: Only rebuilds if Dockerfile changes

This prevents Docker bloat and speeds up development!

## MCP Client Configuration

The MCP client is automatically configured to use:
- **Primary**: `http://localhost:3000/api/sse` (local Docker container)
- **Fallback**: `https://mmcmcphttpbridge-production.up.railway.app/api/sse` (production)

Configuration files:
- `.cursor/settings.json` - Cursor IDE MCP settings
- `.devcontainer/devcontainer.json` - DevContainer MCP settings

## Hot Reload

The container uses volume mounts for hot reload:
- Source code: `./` → `/workspaces/MMC_MCP_BRIDGE`
- `node_modules` and `.next` are excluded (performance)

Changes to code are instantly reflected in the running container.

## Endpoints

Once running, access:
- **Health**: http://localhost:3000/api/health
- **SSE MCP**: http://localhost:3000/api/sse
- **Frontend**: http://localhost:3000

## Environment Variables

Create `.env.local` in project root:

```bash
# Required
MCP_BRIDGE_API_KEY=your-local-dev-key

# Optional (per MCP server)
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
# ... etc
```

## Benefits for Coding Agent

1. **Full MCP Access**: All 26+ MCP servers available locally
2. **Hot Reload**: Instant code changes without restart
3. **Consistent Environment**: Same container reused
4. **Isolated**: No impact on production
5. **Debugging**: Full access to logs and container shell

## Troubleshooting

### Container won't start
```bash
# Check logs
npm run docker:dev:logs

# Rebuild from scratch
npm run docker:dev:stop
npm run docker:dev:build
```

### Port 3000 already in use
```bash
# Stop existing container
npm run docker:dev:stop

# Or change port in docker-compose.dev.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### MCP client can't connect
1. Verify container is running: `docker ps | grep mmc-mcp-bridge-dev`
2. Check health endpoint: `curl http://localhost:3000/api/health`
3. Verify MCP config in `.cursor/settings.json`

