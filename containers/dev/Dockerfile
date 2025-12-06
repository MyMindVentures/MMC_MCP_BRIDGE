# MMC MCP Bridge - Development Container
# Voor development van de app met hot-reload en debugging
FROM node:22.3.0-alpine

# Build arguments
ARG VERSION=2.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels for Docker Desktop and registries
LABEL org.opencontainers.image.title="MMC MCP Bridge - Development Container"
LABEL org.opencontainers.image.description="Development container voor MMC MCP Bridge met hot-reload en debugging - Port 3000 - MCP Client endpoint: /api/sse"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="MyMind Ventures"
LABEL org.opencontainers.image.authors="hello@mymindventures.io"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="dev"
LABEL com.mmc.version="${VERSION}"
LABEL com.mmc.container.type="development"
LABEL com.docker.desktop.service.name="MMC MCP Bridge - Dev"
LABEL com.docker.compose.service="dev"
LABEL com.mmc.endpoints.health="/api/health"
LABEL com.mmc.endpoints.sse="/api/sse"
LABEL com.mmc.endpoints.mcp="/api/mcp"
LABEL com.mmc.port="3000"
LABEL com.mmc.hot-reload="enabled"

# Install system dependencies
RUN apk add --no-cache \
    wget \
    curl \
    bash \
    git \
    ca-certificates

# Install Docker CLI (Alpine Linux - static binary)
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-24.0.7.tgz | \
    tar -xzC /tmp && \
    mv /tmp/docker/docker /usr/local/bin/docker && \
    chmod +x /usr/local/bin/docker && \
    rm -rf /tmp/docker

# Install Docker Compose (standalone binary)
RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

# Install Doppler CLI
RUN curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh && \
    mv /root/.local/bin/doppler /usr/local/bin/doppler 2>/dev/null || true

# Install Dagger CLI for CI/CD support (optional, but useful for testing)
RUN cd /tmp && \
    curl -L https://dl.dagger.io/dagger/install.sh | sh && \
    mv ./bin/dagger /usr/local/bin/dagger && \
    chmod +x /usr/local/bin/dagger

WORKDIR /workspaces/MMC_MCP_BRIDGE

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY --chown=node:node . .

EXPOSE 3000

ENV NODE_ENV=development
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER node

CMD ["npm", "run", "dev:host"]

