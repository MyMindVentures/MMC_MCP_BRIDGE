# Development Container

Development container voor de MMC MCP Bridge applicatie met hot-reload en debugging support.

## Doel

- **Development**: Hot-reload tijdens development
- **Debugging**: Volledige debugging capabilities
- **Testing**: Lokale testing en validatie

## Build & Start

```bash
# Via docker compose (aanbevolen)
docker compose build dev
docker compose up -d dev

# Via build script
./containers/dev/build.sh

# Via npm
npm run docker:dev:up
```

## Logs

```bash
docker compose logs -f dev
```

## Stop

```bash
docker compose stop dev
```

## Details

- **Port**: 3000
- **Mode**: Development (hot-reload)
- **Health Check**: http://localhost:3000/api/health
- **MCP SSE Endpoint**: http://localhost:3000/api/sse

