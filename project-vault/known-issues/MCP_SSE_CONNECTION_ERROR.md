# MCP SSE Connection Error - NGHTTP2_REFUSED_STREAM

**Date:** 2024-12-07  
**Status:** ⚠️ Known Issue - Solution Documented  
**Error:** `ConnectError: [internal] Stream closed with error code NGHTTP2_REFUSED_STREAM`

---

## 🚨 Probleem

**Error Message:**
```
[2025-12-07T12:51:00.413Z] Starting stream
[2025-12-07T12:51:00.551Z] Error: ConnectError: [internal] Stream closed with error code NGHTTP2_REFUSED_STREAM
```

**Symptomen:**
- MCP Bridge SSE connection faalt
- Cursor kan niet verbinden met MCP Bridge
- Error: `NGHTTP2_REFUSED_STREAM`
- MCP servers niet beschikbaar in Cursor

**Betrokken Componenten:**
- MCP Bridge SSE endpoint: `http://localhost:3000/api/sse`
- Next.js development server
- Cursor IDE MCP client

---

## 🔍 Oorzaak

**Mogelijke Oorzaken:**

1. **Cloud Agents Geactiveerd (PRIMARY CAUSE):**
   - Cloud Agents feature is per ongeluk geactiveerd in Cursor
   - Cloud Agents proberen te verbinden en veroorzaken NGHTTP2_REFUSED_STREAM
   - **FIX:** Disable Cloud Agents in `.cursor/settings.json`:
     ```json
     "cursor.general.enableCloudAgents": false
     ```

2. **Server Niet Gestart:**
   - Next.js dev server draait niet op `localhost:3000`
   - Server is gestopt of crasht
   - Port 3000 is bezet door andere applicatie

3. **Server Crasht Bij Opstarten:**
   - Build errors voorkomen server start
   - TypeScript errors
   - Missing dependencies
   - Environment variables ontbreken

4. **Network/Firewall Issues:**
   - Firewall blokkeert localhost:3000
   - Port forwarding problemen
   - Network configuration issues

5. **HTTP/2 Stream Issues:**
   - NGHTTP2_REFUSED_STREAM betekent server weigert connection
   - Server kan requests niet verwerken
   - Server overload of resource limits

---

## ✅ Oplossingen

### Oplossing 1: Disable Cloud Agents (PRIORITY - PRIMARY FIX)

**Dit is de belangrijkste fix!**

1. **Open `.cursor/settings.json`**

2. **Add Cloud Agents disable setting:**
   ```json
   {
     "cursor.general.enableCloudAgents": false
   }
   ```

3. **Reload Cursor:**
   - Command Palette: `Ctrl+Shift+P`
   - Type: "Developer: Reload Window"

4. **Verify:**
   - Cloud Agents should be disabled
   - MCP should connect to local MCP Bridge
   - No more NGHTTP2_REFUSED_STREAM errors

**Note:** Cloud Agents veroorzaken connection conflicts met local MCP Bridge. Always disable Cloud Agents when using local MCP Bridge.

### Oplossing 2: Start Next.js Development Server

**Stappen:**

1. **Check of server draait:**
   ```powershell
   # Check of port 3000 in gebruik is
   netstat -ano | findstr :3000
   ```

2. **Start development server:**
   ```powershell
   # In project root directory
   npm run dev
   # of
   npm run dev:host  # Voor devcontainer (binds to 0.0.0.0)
   ```

3. **Verifieer server draait:**
   - Open browser: `http://localhost:3000/api/health`
   - Should return: `{"status":"ok",...}`
   - Check terminal voor "Ready" message

4. **Test SSE endpoint:**
   - Open: `http://localhost:3000/api/sse`
   - Should start SSE stream (check browser network tab)

### Oplossing 2: Fix Build Errors

**Als server niet start:**

1. **Check TypeScript errors:**
   ```powershell
   npm run type-check
   ```

2. **Fix build errors:**
   ```powershell
   npm run build
   ```

3. **Check missing dependencies:**
   ```powershell
   npm install
   ```

4. **Check environment variables:**
   - Verify `.env.local` exists (if needed)
   - Check Railway dashboard for production env vars
   - Verify Doppler secrets (if using)

### Oplossing 3: Check Port Conflicts

**Als port 3000 bezet is:**

1. **Find process using port 3000:**
   ```powershell
   netstat -ano | findstr :3000
   # Note the PID
   ```

2. **Kill process (if needed):**
   ```powershell
   taskkill /PID <PID> /F
   ```

3. **Or use different port:**
   ```powershell
   # Set PORT environment variable
   $env:PORT=3001
   npm run dev
   # Update .cursor/settings.json MCP URL to http://localhost:3001/api/sse
   ```

### Oplossing 4: Use Railway Production (Fallback)

**Als local server niet werkt:**

1. **Update Cursor settings:**
   - Railway production is al geconfigureerd als fallback
   - Check `.cursor/settings.json`:
     ```json
     "MMC-MCP-Bridge-Railway": {
       "type": "sse",
       "url": "https://mmcmcphttpbridge-production.up.railway.app/api/sse"
     }
     ```

2. **Verify Railway deployment:**
   - Check Railway dashboard
   - Verify deployment is healthy
   - Check `/api/health` endpoint

3. **Use Railway as primary (temporary):**
   - Disable local MCP server in settings
   - Use Railway as primary

### Oplossing 5: Docker DevContainer (Recommended)

**Voor consistent development environment:**

1. **Start devcontainer:**
   ```powershell
   # Via Docker Compose
   docker compose up -d app
   # of
   npm run docker:up:watch  # Met hot reload
   ```

2. **Verify container running:**
   ```powershell
   docker compose ps
   ```

3. **Check logs:**
   ```powershell
   docker compose logs -f app
   ```

4. **Access server:**
   - Server should be on `http://localhost:3000`
   - Or use devcontainer port forwarding

---

## 📋 Verificatie

### Check Server Status

```powershell
# Check if server responds
curl http://localhost:3000/api/health
# Should return: {"status":"ok",...}

# Check SSE endpoint
curl http://localhost:3000/api/sse
# Should start SSE stream
```

### Check Cursor MCP Connection

1. **Open Cursor Settings:**
   - `Ctrl+,` (Windows) of `Cmd+,` (Mac)
   - Search: "MCP"

2. **Verify MCP servers:**
   - Should show "MMC-MCP-Bridge-Local"
   - Status should be "Connected" (green)
   - If red, server not running

3. **Check Cursor Output:**
   - View → Output
   - Select "MCP" channel
   - Check for connection errors

---

## 🔧 Preventie

### Best Practices

1. **Always Start Server Before Using MCP:**
   - Run `npm run dev` before opening Cursor
   - Or use `npm run docker:up:watch` for devcontainer
   - Verify `/api/health` responds before using MCP

2. **Use Health Check:**
   - Check `http://localhost:3000/api/health` before connecting
   - Automate health check in startup scripts
   - Monitor server status

3. **Keep Server Running:**
   - Don't close terminal with dev server
   - Use background processes or services
   - Use Docker for persistent server

4. **Monitor Logs:**
   - Check server logs for errors
   - Monitor Cursor MCP output
   - Check `.cursor/debug.log` for SSE errors

---

## 📝 Notes

- **NGHTTP2_REFUSED_STREAM:** Server weigert HTTP/2 stream connection
- **Common cause:** Server niet gestart of crasht
- **Quick fix:** Start server met `npm run dev`
- **Production fallback:** Railway production server beschikbaar

---

## 🔗 Related

- **SSE Endpoint:** `app/api/sse/route.ts`
- **Health Endpoint:** `app/api/health/route.ts`
- **MCP Config:** `app/api/mcp-config.ts`
- **Docker Setup:** `docker-compose.yml`
- **Package Scripts:** `package.json`

---

## 🎯 Quick Fix

**Snelle Oplossing (PRIMARY):**

1. **Disable Cloud Agents:**
   - Open `.cursor/settings.json`
   - Add: `"cursor.general.enableCloudAgents": false`
   - Save file

2. **Reload Cursor:**
   - Command Palette: `Ctrl+Shift+P`
   - Type: "Developer: Reload Window"
   - MCP should connect automatically

**If still not working, start server:**

3. **Start server:**
   ```powershell
   npm run dev
   ```

4. **Wait for "Ready" message:**
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   ✓ Ready in Xs
   ```

5. **Verify health:**
   ```powershell
   curl http://localhost:3000/api/health
   ```

6. **Reload Cursor again:**
   - Command Palette: `Ctrl+Shift+P`
   - Type: "Developer: Reload Window"

---

**Last Updated:** 2024-12-07  
**Status:** ⚠️ Known Issue - Solution Documented  
**Priority:** High - Blocks MCP functionality

