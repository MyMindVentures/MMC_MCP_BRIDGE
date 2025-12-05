# E2E Test Container

End-to-end test container met Playwright voor MMC MCP Bridge.

## Build & Start

```bash
# Via docker compose (aanbevolen)
docker compose build e2e
docker compose up -d e2e

# Via build script
./containers/e2e/build.sh

# Via npm
npm run docker:e2e:up
```

## Logs

```bash
docker compose logs -f e2e
```

## Stop

```bash
docker compose stop e2e
```

## Details

- **Browser**: Chromium (system)
- **Test Command**: `npm run test:e2e`
- **Independent**: Geen dependencies op andere containers
