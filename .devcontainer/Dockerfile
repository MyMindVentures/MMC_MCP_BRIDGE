# MMC MCP Bridge DevContainer Image
# Base: Microsoft DevContainer TypeScript Node.js 20
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

LABEL maintainer="MyMind Ventures <hello@mymindventures.io>"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="devcontainer"
LABEL com.mmc.version="2.0.0"
LABEL com.mmc.description="MMC MCP Bridge Development Container - Full development environment with Docker CLI"

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

# Copy extension installation script
COPY .devcontainer/install-extensions.sh /usr/local/bin/install-extensions.sh
RUN chmod +x /usr/local/bin/install-extensions.sh

# Copy dev server startup script
COPY .devcontainer/start-dev.sh /usr/local/bin/start-dev.sh
RUN chmod +x /usr/local/bin/start-dev.sh

# Copy settings persistence script
COPY .devcontainer/persist-settings.sh /usr/local/bin/persist-settings.sh
RUN chmod +x /usr/local/bin/persist-settings.sh

# Copy todo sync script
COPY .devcontainer/sync-todos.sh /usr/local/bin/sync-todos.sh
RUN chmod +x /usr/local/bin/sync-todos.sh

# Copy auto git workflow script
COPY .devcontainer/auto-git-workflow.sh /usr/local/bin/auto-git-workflow.sh
RUN chmod +x /usr/local/bin/auto-git-workflow.sh

# Copy git watcher script
COPY .devcontainer/git-watcher.sh /usr/local/bin/git-watcher.sh
RUN chmod +x /usr/local/bin/git-watcher.sh

# Copy feature tracker script
COPY .devcontainer/feature-tracker.sh /usr/local/bin/feature-tracker.sh
RUN chmod +x /usr/local/bin/feature-tracker.sh

# Copy app container build script
COPY .devcontainer/build-app-container.sh /usr/local/bin/build-app-container.sh
RUN chmod +x /usr/local/bin/build-app-container.sh

# Install jq for JSON parsing in scripts
RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspaces

# Set user
USER node
