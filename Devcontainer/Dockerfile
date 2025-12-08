FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Build arguments
ARG VERSION=2.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels for Docker Desktop - Full Stack Integrated App
LABEL org.opencontainers.image.title="MMC MCP Bridge - Full Stack Integrated App"
LABEL org.opencontainers.image.description="Enterprise MCP Orchestration Platform - 26+ MCP Servers, n8n Integration, Agentic AI, Full Stack App met alle features geïntegreerd"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="MyMind Ventures"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="fullstack-app"
LABEL com.mmc.version="${VERSION}"
LABEL com.mmc.container.type="fullstack-integrated"
LABEL com.mmc.app.type="mcp-orchestration-platform"
LABEL com.mmc.features="26-mcp-servers,n8n-integration,agentic-ai,frontend-i18n,agent-suite"
LABEL com.mmc.hot-reload="enabled"
LABEL com.mmc.docker-watch="enabled"
LABEL com.mmc.endpoints.health="/api/health"
LABEL com.mmc.endpoints.sse="/api/sse"
LABEL com.mmc.endpoints.mcp="/api/mcp"
LABEL com.mmc.endpoints.agent="/api/agent"
LABEL com.mmc.endpoints.n8n="/api/n8n"
LABEL com.mmc.port="3000"

# Install system dependencies for Full Stack App
# - Python & build tools: voor native modules (better-sqlite3, etc.)
# - Database clients: PostgreSQL, MongoDB, SQLite
# - Development tools: git, curl, jq, etc.
# - All tools nodig voor 26+ MCP servers, n8n, Agent Suite
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    ca-certificates \
    vim \
    nano \
    redis-tools \
    postgresql-client \
    gnupg \
    python3 \
    python3-pip \
    make \
    g++ \
    build-essential \
    jq \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install PowerShell Core (pwsh) for Linux
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/repos/microsoft-debian-bullseye-prod bullseye main" > /etc/apt/sources.list.d/microsoft-prod.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends powershell \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Docker CLI and Docker Compose to connect to Docker Desktop on host
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bullseye stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI for GitHub operations
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends gh \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Dagger CLI for CI/CD pipeline testing
RUN cd /tmp && \
    curl -L https://dl.dagger.io/dagger/install.sh | sh && \
    mv ./bin/dagger /usr/local/bin/dagger && \
    chmod +x /usr/local/bin/dagger

# Install Doppler CLI (Official Doppler installation) - CRITICAL FOR CREDENTIALS
RUN curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list \
    && apt-get update \
    && apt-get install -y doppler \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install 1Password CLI (Official 1Password installation) - CRITICAL FOR CREDENTIALS
RUN curl -sS https://downloads.1password.com/linux/keys/1password.asc | gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg \
    && echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main' | tee /etc/apt/sources.list.d/1password.list \
    && apt-get update \
    && apt-get install -y 1password-cli \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Playwright system dependencies for E2E testing (optional, but useful)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Copy consolidated devcontainer script
# Build context is parent directory (..), so paths are relative to project root
COPY .devcontainer/devcontainer.sh /usr/local/bin/devcontainer.sh
RUN chmod +x /usr/local/bin/devcontainer.sh

# Copy workflow wrapper scripts (both bash and PowerShell)
COPY .devcontainer/workflow-wrapper.sh /usr/local/bin/workflow
COPY .devcontainer/workflow-wrapper.ps1 /usr/local/bin/workflow.ps1
RUN chmod +x /usr/local/bin/workflow

# Create workflow scripts symlink directory for easy access
RUN mkdir -p /usr/local/bin/workflows

# Copy package files for dependency installation (agents will install dependencies)
# package-lock.json is optional (wildcard handles missing file gracefully)
COPY package.json /workspaces/MMC_MCP_BRIDGE/
COPY package-lock.json* /workspaces/MMC_MCP_BRIDGE/

# Set working directory (source code will be bind-mounted by devcontainer or copied during build)
WORKDIR /workspaces/MMC_MCP_BRIDGE

# ============================================================================
# FULL STACK INTEGRATED APP - Environment Variables
# ============================================================================
# Dit is een Full Stack Integrated App met:
# - 26+ MCP Servers (databases, AI, dev tools, productivity)
# - n8n bidirectional integration
# - Agentic AI orchestration
# - Frontend met i18n (10 talen)
# - Agent Suite met specialisten
# - Alle features geïntegreerd in één app container
# ============================================================================

# Environment variables for hot reload and development
ENV NODE_ENV=development
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Hot reload environment variables (voor Docker Watch en file watching)
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV WATCHPACK_WATCHER_LIMIT=10000

# Full Stack App identifiers
ENV MMC_APP_TYPE="fullstack-integrated"
ENV MMC_FEATURES="26-mcp-servers,n8n-integration,agentic-ai,frontend-i18n,agent-suite"

# Expose port for Next.js dev server (Full Stack App)
EXPOSE 3000

# Set user
USER node
