### ⚡ Hot Reload & Terminal Management (MANDATORY)

**CRITICAL:** Gebruik ALTIJD Hot Reload - NOOIT container rebuilds voor code wijzigingen!

#### Dependency Installation (MANDATORY - Agent Responsibility)

**ELKE AGENT IS VERANTWOORDELIJK VOOR DEPENDENCY INSTALLATIE:**

- ✅ **ALWAYS**: Check if dependencies are installed: `ls -la node_modules/ | head -5`
- ✅ **ALWAYS**: If `node_modules/` missing or incomplete → Install: `npm install` or `npm ci`
- ✅ **ALWAYS**: After `package.json` changes → Install dependencies immediately
- ✅ **ALWAYS**: Verify installation: `npm list --depth=0` or check for errors
- ❌ **NEVER**: Assume dependencies are installed
- ❌ **NEVER**: Skip dependency installation when `package.json` changes
- ❌ **NEVER**: Continue without verifying dependencies are installed

**Installation Commands:**

```bash
# Check if node_modules exists
ls -la node_modules/ | head -5

# Install dependencies (use existing terminal, NOT new terminal)
npm install
# or for CI/CD environments
npm ci

# Verify installation
npm list --depth=0
```

#### Hot Reload Workflow

1. **Check if Next.js dev server is running:**

   ```bash
   ps aux | grep "next dev" | grep -v grep
   ```

2. **If not running, start in EXISTING terminal (NOT new terminal):**

   ```bash
   npm run dev:host
   ```

3. **Code changes are automatically synced via:**
   - Next.js Fast Refresh (automatic in dev mode)
   - Docker Compose Watch (if using `docker compose watch`)
   - No rebuild needed for source code changes!

#### When to Rebuild vs Hot Reload

- ✅ **Hot Reload (NO rebuild):**
  - Source code wijzigingen (`app/`, `public/`, `messages/`, etc.)
  - Config file wijzigingen (`tsconfig.json`, `middleware.ts`, etc.)
  - Style/CSS wijzigingen

- ✅ **Rebuild Container (ONLY when needed):**
  - `package.json` of `package-lock.json` wijzigingen
  - `.devcontainer/Dockerfile` wijzigingen
  - System dependency changes

#### Terminal Reuse (MANDATORY)

- ✅ **ALWAYS**: Check if terminal already exists before creating new one
- ✅ **ALWAYS**: Reuse existing terminal sessions
- ✅ **ALWAYS**: Check terminal history: Look for existing `run_terminal_cmd` calls in conversation
- ❌ **NEVER**: Create new terminals unnecessarily
- ❌ **NEVER**: Start new processes when existing ones are running

#### Hot Reload Best Practices

- ✅ **ALWAYS**: Make code changes → Wait for Next.js Fast Refresh → Test immediately
- ✅ **ALWAYS**: Check browser console for hot reload status
- ✅ **ALWAYS**: Verify changes are reflected without page reload
- ❌ **NEVER**: Rebuild container for source code changes
- ❌ **NEVER**: Restart dev server for code changes (unless absolutely necessary)
