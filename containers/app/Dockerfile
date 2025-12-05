# MMC MCP Bridge - Full Stack App Container
# Productie-ready container voor de volledige MMC MCP Bridge applicatie
FROM node:22.3.0-alpine AS builder

LABEL com.mmc.project="mmc-mcp-bridge"
LABEL com.mmc.component="app"
LABEL com.mmc.version="2.0.0"

WORKDIR /workspaces/MMC_MCP_BRIDGE

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.3.0-alpine AS runner

WORKDIR /workspaces/MMC_MCP_BRIDGE

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder /workspaces/MMC_MCP_BRIDGE/.next ./.next
COPY --from=builder /workspaces/MMC_MCP_BRIDGE/node_modules ./node_modules
COPY --from=builder /workspaces/MMC_MCP_BRIDGE/package.json ./package.json
COPY --from=builder /workspaces/MMC_MCP_BRIDGE/app ./app
COPY --from=builder /workspaces/MMC_MCP_BRIDGE/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER node

CMD ["npm", "run", "start"]
