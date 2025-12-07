# MMC MCP Bridge - E2E Test Container
# Voor end-to-end testing, validatie en debugging
FROM node:22.3.0-alpine

# Build arguments
ARG VERSION=2.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels for Docker Desktop and registries
LABEL org.opencontainers.image.title="MMC MCP Bridge - E2E Test Container"
LABEL org.opencontainers.image.description="E2E test container voor MMC MCP Bridge met Playwright en Dagger CI/CD"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="MyMind Ventures"
LABEL org.opencontainers.image.authors="hello@mymindventures.io"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="e2e"
LABEL com.mmc.version="${VERSION}"
LABEL com.mmc.container.type="testing"
LABEL com.docker.desktop.service.name="MMC MCP Bridge - E2E"
LABEL com.docker.compose.service="e2e"
LABEL com.mmc.tools="playwright,dagger"
LABEL com.mmc.mode="testing"

# Install dependencies for Playwright and Dagger
RUN apk add --no-cache \
    bash \
    curl \
    wget \
    git \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install Docker CLI (Alpine Linux - static binary)
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-24.0.7.tgz | \
    tar -xzC /tmp && \
    mv /tmp/docker/docker /usr/local/bin/docker && \
    chmod +x /usr/local/bin/docker && \
    rm -rf /tmp/docker

# Install Docker Compose (standalone binary)
RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# Install Dagger CLI for CI/CD pipeline testing
RUN cd /tmp && \
    curl -L https://dl.dagger.io/dagger/install.sh | sh && \
    mv ./bin/dagger /usr/local/bin/dagger && \
    chmod +x /usr/local/bin/dagger

# Install CodeQL CLI for security scanning (optional - skip if download fails)
RUN cd /tmp && \
    wget -q --timeout=10 --tries=1 https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-bundle-linux64.tar.gz 2>/dev/null && \
    (tar -xzf codeql-bundle-linux64.tar.gz && \
    mv codeql /usr/local/bin/codeql && \
    chmod +x /usr/local/bin/codeql && \
    rm -f codeql-bundle-linux64.tar.gz && \
    echo "CodeQL CLI installed successfully") || echo "CodeQL CLI installation skipped - optional tool"

# Install SonarQube Scanner for code analysis (optional - skip if download fails)
RUN cd /tmp && \
    (wget -q --timeout=10 --tries=1 https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip && \
    unzip -q sonar-scanner-cli-5.0.1.3006-linux.zip && \
    mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner && \
    ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm -f sonar-scanner-cli-5.0.1.3006-linux.zip && \
    echo "SonarQube Scanner installed successfully") || (echo "SonarQube Scanner installation skipped - optional tool" && true)

# Install GitHub CLI for PR labeling (Alpine)
RUN apk add --no-cache github-cli || echo "GitHub CLI not available in Alpine repos"

# Install unzip for SonarQube Scanner
RUN apk add --no-cache unzip

# Set Playwright to use system Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /workspaces/MMC_MCP_BRIDGE

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Install PowerShell Core for Alpine Linux
# Note: PowerShell installation is optional - scripts can fallback to bash
RUN apk add --no-cache \
    ca-certificates \
    less \
    ncurses-terminfo-base \
    krb5-libs \
    libgcc \
    libintl \
    libssl3 \
    libstdc++ \
    tzdata \
    userspace-rcu \
    zlib \
    icu-libs \
    curl && \
    (curl -L https://github.com/PowerShell/PowerShell/releases/download/v7.4.0/powershell-7.4.0-linux-alpine-x64.tar.gz -o /tmp/powershell.tar.gz && \
    mkdir -p /opt/microsoft/powershell/7 && \
    tar zxf /tmp/powershell.tar.gz -C /opt/microsoft/powershell/7 && \
    chmod +x /opt/microsoft/powershell/7/pwsh && \
    ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/pwsh && \
    ln -s /opt/microsoft/powershell/7/pwsh /usr/bin/powershell && \
    rm -f /tmp/powershell.tar.gz) || echo "PowerShell installation failed, will use bash fallback"

# Copy source code (exclude node_modules via .dockerignore)
COPY --chown=node:node . .

# Copy workflow scripts (both .sh and .ps1) - only copy what we need
COPY --chown=node:node containers/e2e/workflows/*.ps1 /workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/ 2>/dev/null || true
COPY --chown=node:node containers/e2e/workflows/*.sh /workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/ 2>/dev/null || true
RUN chmod +x /workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/*.ps1 /workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/*.sh 2>/dev/null || true

USER node

# Default command runs all workflows (PowerShell)
CMD ["pwsh", "-File", "/workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/run-all.ps1"]
