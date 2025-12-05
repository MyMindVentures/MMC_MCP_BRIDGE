# App Container

Next.js development server container voor de MMC MCP Bridge applicatie.

## Build & Start

```bash
# Via docker compose (aanbevolen)
docker compose build app
docker compose up -d app

# Via build script
./containers/app/build.sh

# Via npm
npm run docker:app:up
```

## Logs

```bash
docker compose logs -f app
```

## Stop

```bash
docker compose stop app
```

## Details

- **Port**: 3000
- **Health Check**: http://localhost:3000/api/health
- **MCP SSE Endpoint**: http://localhost:3000/api/sse
