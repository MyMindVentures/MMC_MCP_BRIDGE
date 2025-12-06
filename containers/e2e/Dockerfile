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

# Set Playwright to use system Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /workspaces/MMC_MCP_BRIDGE

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY --chown=node:node . .

# Copy workflow scripts and make executable
COPY --chown=node:node containers/e2e/workflows/ /workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/
RUN chmod +x /workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/*.sh

USER node

# Default command runs all workflows
CMD ["/workspaces/MMC_MCP_BRIDGE/containers/e2e/workflows/run-all.sh"]
