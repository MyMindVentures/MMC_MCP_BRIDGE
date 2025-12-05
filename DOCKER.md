# 🐳 Docker Containers - Standalone Build & Deploy

**GEEN GEZEIK - GEWOON WERKEN**

Alle containers zijn volledig standalone. Geen dependencies, geen complexe setup.

## 🚀 Quick Start

### Option 1: Build All (Aanbevolen)

```bash
./build-all.sh
```

### Option 2: Build Individueel

**E2E Container:**

```bash
./build-e2e.sh
```

**App Container:**

```bash
./build-app.sh
```

## 📦 Containers

### 1. E2E Container (`MMC_MCP_Bridge_E2E`)

- **Purpose**: End-to-end testing met Dagger
- **Build**: `docker compose -f docker-compose.e2e.yml build`
- **Start**: `docker compose -f docker-compose.e2e.yml up -d`
- **Logs**: `docker compose -f docker-compose.e2e.yml logs -f`
- **Stop**: `docker compose -f docker-compose.e2e.yml stop`

### 2. App Container (`MMC_MCP_Bridge_App`)

- **Purpose**: Next.js development server met hot reload
- **Port**: `http://localhost:3000`
- **Build**: `docker compose -f docker-compose.dev.yml build`
- **Start**: `docker compose -f docker-compose.dev.yml up -d`
- **Logs**: `docker compose -f docker-compose.dev.yml logs -f`
- **Stop**: `docker compose -f docker-compose.dev.yml stop`

## 🔧 Standalone Build Commands

Elke container kan volledig standalone gebouwd worden:

```bash
# E2E - volledig standalone
docker compose -f docker-compose.e2e.yml build
docker compose -f docker-compose.e2e.yml up -d

# App - volledig standalone
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d
```

## 🌐 Services

Na start:

- **App**: http://localhost:3000
- **MCP Bridge SSE**: http://localhost:3000/api/sse
- **Health Check**: http://localhost:3000/api/health

## 🛑 Stop All

```bash
docker compose -f docker-compose.e2e.yml stop
docker compose -f docker-compose.dev.yml stop
```

## 🧹 Clean Up

```bash
# Stop and remove containers
docker compose -f docker-compose.e2e.yml down
docker compose -f docker-compose.dev.yml down

# Remove volumes (optional)
docker volume rm mmc-mcp-bridge-node-modules mmc-mcp-bridge-next-cache
```

## ⚠️ Troubleshooting

**Docker permission denied?**

```bash
sudo chmod 666 /var/run/docker.sock
```

**Port 3000 already in use?**

```bash
# Stop existing container
docker compose -f docker-compose.dev.yml stop

# Or change port in docker-compose.dev.yml
```

**Network errors?**
Networks worden automatisch aangemaakt. Geen manual setup nodig.

## 📝 Notes

- Alle containers zijn **volledig standalone**
- Geen externe dependencies
- Networks worden automatisch aangemaakt
- Volumes worden automatisch aangemaakt
- **GEWOON WERKEN**
