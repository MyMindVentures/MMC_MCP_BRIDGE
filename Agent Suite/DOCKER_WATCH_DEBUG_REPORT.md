# 🐳 Docker Compose Watch Debug Report

**Date:** 2024-12-06  
**Issue:** `docker compose watch` fails with "The system cannot execute the specified program"

---

## 🔍 Problem Analysis

### Error Message

```
The system cannot execute the specified program.
PS D:\GitHub_Local_Repos\MMC_MCP_BRIDGE> npm run docker:up:watch
> mmc-mcp-bridge@2.0.0 docker:up:watch
> docker compose watch
The system cannot execute the specified program.
```

### Root Cause Hypotheses

**Hypothesis F1: Docker Compose Watch Not Available**

- Docker Compose Watch requires Docker Compose v2.22.0+
- Older versions don't support `watch` command
- Windows Docker Desktop might have different version

**Hypothesis F2: PATH Issues**

- Docker not in PATH
- Docker Compose plugin not installed
- PowerShell execution policy blocking

**Hypothesis F3: Docker Desktop Not Running**

- Docker daemon not started
- Docker Desktop service stopped
- WSL2 backend issues (if using WSL2)

---

## ✅ Solution Implemented

### 1. PowerShell Fallback Script

**File:** `scripts/docker-watch-fallback.ps1`

**Features:**

- Checks if `docker compose watch` is available
- Falls back to `docker compose up` if not available
- Bind mounts still provide hot reload (Next.js Fast Refresh)
- Comprehensive debug logging

### 2. Updated package.json

```json
"docker:up:watch": "pwsh -File ./scripts/docker-watch-fallback.ps1"
```

### 3. Debug Logging

- Logs to `.cursor/debug.log` (NDJSON format)
- Console output with colors
- Docker version detection
- Exit code tracking

---

## 🔧 How It Works

### If Watch Available:

```powershell
docker compose watch
# Provides automatic file sync + rebuild on dependency changes
```

### If Watch Not Available (Fallback):

```powershell
docker compose up -d --build app
# Bind mounts (.:/workspaces/MMC_MCP_BRIDGE) still provide hot reload
# Next.js Fast Refresh works automatically
```

**Note:** The fallback still provides hot reload because:

- Bind mount syncs files immediately
- Next.js Fast Refresh detects changes
- No container restart needed for code changes

---

## 📊 Debug Information Needed

To complete the analysis, we need:

1. **Docker Version:**

   ```powershell
   docker --version
   docker compose version
   ```

2. **Watch Availability:**

   ```powershell
   docker compose watch --help
   ```

3. **Script Execution:**

   ```powershell
   npm run docker:up:watch
   ```

4. **Debug Logs:**
   - Check `.cursor/debug.log` for detailed information

---

## 🚀 Next Steps

1. **Run the script:**

   ```powershell
   npm run docker:up:watch
   ```

2. **Check output:**
   - Script will show if Watch is available
   - Will use fallback if not available
   - Debug logs written to `.cursor/debug.log`

3. **Verify container:**

   ```powershell
   docker ps -a
   docker compose logs app
   ```

4. **Test hot reload:**
   - Make a code change in `app/page.tsx`
   - Check if browser updates automatically
   - View logs: `npm run docker:logs`

---

## 📝 Expected Behavior

### With Watch (if available):

- ✅ Automatic file sync on code changes
- ✅ Automatic rebuild on dependency changes
- ✅ Real-time hot reload

### With Fallback (if Watch not available):

- ✅ Bind mount syncs files immediately
- ✅ Next.js Fast Refresh works
- ✅ Hot reload still functional
- ⚠️ Manual rebuild needed for dependency changes

---

**Status:** ⚠️ **WAITING FOR RUNTIME EVIDENCE**

Run `npm run docker:up:watch` and check:

1. Console output
2. `.cursor/debug.log` file
3. Container status: `docker ps -a`
