# Full Stack App Container

Productie-ready container voor de volledige MMC MCP Bridge applicatie.

## Doel

- **Production**: Productie-ready deployment
- **Full Stack**: Complete applicatie met alle features
- **Optimized**: Geoptimaliseerd voor performance

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
- **Mode**: Production
- **Health Check**: http://localhost:3000/api/health
- **MCP SSE Endpoint**: http://localhost:3000/api/sse
- **Multi-stage Build**: Geoptimaliseerd voor productie
