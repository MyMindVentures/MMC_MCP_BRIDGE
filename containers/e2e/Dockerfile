# MMC MCP Bridge - E2E Test Container
# Voor end-to-end testing, validatie en debugging
FROM node:22.3.0-alpine

# Build arguments
ARG VERSION=2.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels for Docker Desktop and registries
LABEL org.opencontainers.image.title="MMC MCP Bridge - E2E Test Container"
LABEL org.opencontainers.image.description="E2E test container voor MMC MCP Bridge met Playwright"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="MyMind Ventures"
LABEL org.opencontainers.image.authors="hello@mymindventures.io"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="e2e"
LABEL com.mmc.version="${VERSION}"
LABEL com.mmc.container.type="testing"

# Install dependencies for Playwright
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

USER node

CMD ["npm", "run", "test:e2e"]
