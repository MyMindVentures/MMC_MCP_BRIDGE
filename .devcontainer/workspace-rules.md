# 🔒 STRICT WORKSPACE RULES - MMC MCP BRIDGE

## ⚠️ CRITICAL: ONLY 6 FILES ALLOWED IN REPOSITORY

This project follows an **EXTREMELY STRICT** file structure. You MUST NOT deviate from this under ANY circumstances.

### ✅ ALLOWED FILES (EXACTLY 6):

1. `railway.json` - Railway deployment configuration
2. `package.json` - NPM dependencies and scripts
3. `package-lock.json` - NPM lockfile (OR pnpm-lock.yaml OR yarn.lock - ONLY ONE)
4. `README.md` - Project documentation
5. `.env.example` - Environment variables template
6. `app/page.tsx` - Single Next.js page with ALL functionality (UI + API routes)

### 🚫 FORBIDDEN - NEVER CREATE THESE:

- ❌ NO `tsconfig.json`
- ❌ NO `next.config.js` or `next.config.mjs`
- ❌ NO `.eslintrc.*` or `.prettierrc.*`
- ❌ NO `.env` files (use Railway environment variables)
- ❌ NO additional directories under `app/` (no `app/api/`, `app/components/`, etc.)
- ❌ NO `src/` folder
- ❌ NO `components/` folder
- ❌ NO `lib/` or `utils/` folders
- ❌ NO test files
- ❌ NO additional markdown files
- ❌ NO Dockerfile
- ❌ NO `.github/` folder
- ❌ NO CI/CD configs

### 📋 RULES FOR DEVELOPMENT:

1. **ALL functionality MUST fit in `app/page.tsx`**
   - Frontend UI components
   - API route handlers (using Next.js 15 App Router patterns)
   - Server-side logic
   - Database connections
   - MCP server integrations

2. **NO new files can be created** except:
   - Modifications to the 6 allowed files
   - Build artifacts (`node_modules/`, `.next/`)
   - Git metadata (`.git/`)

3. **If you need to add functionality:**
   - Add it to `app/page.tsx`
   - Use inline styles or Tailwind classes
   - Keep everything in a single file

4. **Dependencies:**
   - Add to `package.json` only
   - No config files for tools

5. **Deployment:**
   - Railway handles everything via `railway.json`
   - No Docker, no custom build scripts

### 🎯 PHILOSOPHY:

**RADICAL MINIMALISM** - This project proves that complex full-stack applications can run with just 6 files. Every additional file is considered bloat.

### ⚡ QUICK START:

```bash
npm install
npm run dev
```

### 🚀 DEPLOYMENT:

```bash
git push  # Railway auto-deploys
```

---

**IF IN DOUBT: DON'T CREATE IT!**

This file is mounted read-only in the devcontainer as a constant reminder of these rules.

