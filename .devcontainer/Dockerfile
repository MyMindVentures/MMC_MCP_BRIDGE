# MMC MCP Bridge DevContainer Image
# Base: Microsoft DevContainer TypeScript Node.js 20
# Docker Hub: mymindventures/mmc-mcp-bridge-devcontainer:2.0.0
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

LABEL maintainer="MyMind Ventures <hello@mymindventures.io>"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="devcontainer"
LABEL com.mmc.version="2.0.0"
LABEL com.mmc.name="MMC_MCP_Bridge_DevContainer"
LABEL com.mmc.description="MMC MCP Bridge Development Container - Full development environment with Docker CLI"
LABEL com.mmc.image="mymindventures/mmc-mcp-bridge-devcontainer:2.0.0"
LABEL org.opencontainers.image.source="https://github.com/mymindventures/mmc-mcp-bridge"
LABEL org.opencontainers.image.title="MMC_MCP_Bridge_DevContainer"
LABEL org.opencontainers.image.version="2.0.0"

# Install additional tools (including lsb-release for Docker installation)
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
    lsb-release \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install PowerShell Core (pwsh) for Linux
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/repos/microsoft-debian-bullseye-prod bullseye main" > /etc/apt/sources.list.d/microsoft-prod.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends powershell \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Docker CLI and Buildx (to connect to Docker Desktop on host)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends docker-ce-cli docker-compose-plugin docker-buildx-plugin \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/* \
    && docker buildx version || echo "Buildx will be available after Docker connection"

# Install jq for JSON parsing in scripts
RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

# Copy only essential devcontainer scripts (not build scripts - those are mounted from host)
# Build context is parent directory (..), so .devcontainer/ is correct
COPY .devcontainer/install-extensions.sh /usr/local/bin/install-extensions.sh
COPY .devcontainer/persist-settings.sh /usr/local/bin/persist-settings.sh
COPY .devcontainer/sync-todos.sh /usr/local/bin/sync-todos.sh
COPY .devcontainer/auto-git-workflow.sh /usr/local/bin/auto-git-workflow.sh
COPY .devcontainer/git-watcher.sh /usr/local/bin/git-watcher.sh
COPY .devcontainer/feature-tracker.sh /usr/local/bin/feature-tracker.sh

# Make scripts executable
RUN chmod +x /usr/local/bin/install-extensions.sh \
    && chmod +x /usr/local/bin/persist-settings.sh \
    && chmod +x /usr/local/bin/sync-todos.sh \
    && chmod +x /usr/local/bin/auto-git-workflow.sh \
    && chmod +x /usr/local/bin/git-watcher.sh \
    && chmod +x /usr/local/bin/feature-tracker.sh

# Set working directory (source code will be bind-mounted by devcontainer)
WORKDIR /workspaces/MMC_MCP_BRIDGE

# Set user
USER node
