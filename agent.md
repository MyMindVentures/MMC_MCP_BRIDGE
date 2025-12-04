# 🤖 AI Coding Agent - Strict Behavior Rules

## Core Principle: RADICAL MINIMALISM

Every file, every line, every dependency must be justified.
**When in doubt → ASK THE USER**

---

## 1. Git Workflow - MANDATORY

### ✅ DO:
- Create feature branch for EVERY change: `git checkout -b feature/description`
- Test build locally: `npm run build` MUST succeed
- Push feature branch: `git push origin feature/description`
- Wait for Railway preview deployment
- Test preview URL
- Only merge to main when preview is healthy
- Delete feature branch after merge

### ❌ NEVER:
- Commit directly to main (except critical hotfixes)
- Push broken builds
- Merge untested code
- Use main as testing ground

---

## 2. File System - STRICT RULES

### ✅ ALLOWED Files:
1. `package.json` - Dependencies & scripts
2. `railway.json` - Deployment config
3. `README.md` - Documentation (if requested)
4. `app/page.tsx` - Frontend
5. `app/api/**/*.ts` - Backend routes
6. ONE lockfile: `package-lock.json` OR `pnpm-lock.yaml` OR `yarn.lock`

### ❌ FORBIDDEN Files:
- Config files: `tsconfig.json`, `next.config.js`, `.eslintrc.*`, etc.
- CI/CD: `.github/`, `Dockerfile`, GitHub Actions
- Environment: `.env`, `.env.local`
- Scripts: `scripts/` folder
- Docs: Multiple `.md` files (use README.md only)
- Directories: `src/`, `lib/`, `components/` (unless requested)

### 🗑️ AUTO-GENERATED (Delete if appear):
- `tsconfig.json` - Next.js auto-generates
- `next-env.d.ts` - Next.js auto-generates
- Add to `.gitignore`

---

## 3. Before Creating ANY File

**STOP and ask:**
1. Is this in the allowed list?
2. Did user explicitly request this?
3. Can I achieve this without a new file?

**If NO to any → ASK USER FIRST**

Example:
> "This requires `scripts/deploy.sh`. Rules forbid this. Should I:
> A) Add logic to package.json instead?
> B) Create exception for this file?
> C) Find another approach?"

---

## 4. Dependencies

### Before adding ANY dependency:
1. Is it absolutely necessary?
2. Does it require config files? (If yes → forbidden)
3. Is there a simpler alternative?

### Keep package.json minimal:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT"
  }
}
```

**NO:** lint scripts, format scripts, test scripts (unless requested)

---

## 5. Testing - MANDATORY

### Before EVERY commit:
```bash
npm run build  # Must succeed
```

### Before merging to main:
1. Local build succeeds ✅
2. Railway preview deployed ✅
3. Preview is healthy ✅
4. Feature is complete ✅

---

## 6. Railway Deployment

### `railway.json` is the ONLY config:
```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ALWAYS"
  }
}
```

**NO Dockerfile, NO GitHub Actions, NO custom CI/CD**

Railway provides:
- Auto-build on push
- PR preview deployments
- Environment variables
- Health checks

---

## 7. Common Mistakes - AVOID

### ❌ Mistake 1: Committing to main
Use feature branches for EVERYTHING

### ❌ Mistake 2: Creating "helpful" files
ASK FIRST before creating scripts/docs/configs

### ❌ Mistake 3: Pushing broken builds
ALWAYS test `npm run build` first

### ❌ Mistake 4: Over-engineering
Keep it simple, don't add complexity

### ❌ Mistake 5: Ignoring auto-generated files
Delete `tsconfig.json` if it appears

---

## 8. Repository Structure

```
project-root/
├── package.json          ✅ Required
├── package-lock.json     ✅ Required
├── railway.json          ✅ Required
├── README.md             ✅ Optional
├── .gitignore            ✅ Required
└── app/
    ├── page.tsx          ✅ Frontend
    └── api/              ✅ Backend
        └── **/*.ts       ✅ API routes
```

**NOTHING ELSE AT ROOT**

---

## 9. Quick Checklist

### Before committing:
- [ ] On feature branch (not main)
- [ ] `npm run build` succeeds
- [ ] No auto-generated files
- [ ] No forbidden files created
- [ ] Clear commit message

### Before merging to main:
- [ ] Railway preview healthy
- [ ] Feature complete & tested
- [ ] No debug code
- [ ] Ready for production

---

## 10. The Golden Rules

1. **NEVER commit to main** (use feature branches)
2. **NEVER create files** without checking allowed list
3. **NEVER push broken builds**
4. **ALWAYS test locally** before pushing
5. **ALWAYS ask** if unsure
6. **KEEP IT MINIMAL** - less is more
7. **USE RAILWAY** for CI/CD
8. **ONE README** for all docs

---

## When Unsure

**STOP → ASK USER → DON'T ASSUME**

Better to ask than to create unwanted files or break the build.

