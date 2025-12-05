# MMC MCP Bridge - Full Stack App Container
# Productie-ready container voor de volledige MMC MCP Bridge applicatie
FROM node:22.3.0-alpine AS builder

# Build arguments
ARG VERSION=2.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels for Docker Desktop and registries
LABEL org.opencontainers.image.title="MMC MCP Bridge - Production App"
LABEL org.opencontainers.image.description="Productie-ready container voor MMC MCP Bridge applicatie"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="MyMind Ventures"
LABEL org.opencontainers.image.authors="hello@mymindventures.io"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="app"
LABEL com.mmc.version="${VERSION}"
LABEL com.mmc.container.type="production"

WORKDIR /workspaces/MMC_MCP_BRIDGE

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.3.0-alpine AS runner

# Build arguments
ARG VERSION=2.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels for production image
LABEL org.opencontainers.image.title="MMC MCP Bridge - Production App"
LABEL org.opencontainers.image.description="Productie-ready container voor MMC MCP Bridge applicatie"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.vendor="MyMind Ventures"
LABEL org.opencontainers.image.authors="hello@mymindventures.io"
LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="app"
LABEL com.mmc.version="${VERSION}"
LABEL com.mmc.container.type="production"

# Install wget for healthcheck
RUN apk add --no-cache wget ca-certificates

WORKDIR /workspaces/MMC_MCP_BRIDGE

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package.json for npm start command
COPY --from=builder --chown=node:node /workspaces/MMC_MCP_BRIDGE/package.json ./package.json

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=node:node /workspaces/MMC_MCP_BRIDGE/.next ./.next
COPY --from=builder --chown=node:node /workspaces/MMC_MCP_BRIDGE/app ./app
COPY --from=builder --chown=node:node /workspaces/MMC_MCP_BRIDGE/public ./public

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER node

CMD ["npm", "run", "start"]
