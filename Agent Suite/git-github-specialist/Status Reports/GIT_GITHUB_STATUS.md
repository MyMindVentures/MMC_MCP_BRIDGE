# Git & GitHub Specialist - Status Overzicht

**Laatste update:** $(date)

## Huidige Repository Status

### Git Workflow Documentatie

✅ **Git/GitHub Specialist Workflow** - Volledig gedocumenteerd in `.cursor/rules/git-github-specialist.mdc`

De workflow documentatie bevat:

- Complete branch strategy en naming conventions
- Pre-commit en pre-merge checklists
- PR review en merge process
- GitHub Actions monitoring procedures
- Railway preview deployment validation
- Emergency procedures voor broken main branch

### GitHub Actions Workflows

**❌ GEEN GitHub Actions workflows worden gebruikt!**

**CI/CD wordt volledig gedaan via:**

- ✅ **Railway** - Auto-deploy op push/PR (zie `railway.json`)
- ✅ **Dagger** - Container builds en pipelines (zie `.dagger/pipeline.ts`)
- ✅ **E2E Container** - Lokale workflow testing (zie `containers/e2e/workflows/`)

**Waarom geen GitHub Actions?**

- Volledige controle over CI/CD
- Eenvoudiger te debuggen
- Dependabot/Copilot interferentie voorkomen
- Lokale testing mogelijk maken
- Kosten besparen

### Monorepo Architecture

Het project volgt een monorepo structuur met:

```
/workspaces/MMC_MCP_BRIDGE/
├── .github/workflows/     # 11 GitHub Actions workflows
├── app/                    # Next.js application
│   ├── api/               # API routes (MCP bridge)
│   ├── layout.tsx
│   └── page.tsx
├── containers/            # Docker containers
│   ├── dev/              # Development container
│   ├── app/              # Production container
│   └── e2e/              # E2E test container
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies & scripts
├── railway.json          # Railway deployment config
├── Tasklist.prd          # Task tracking
└── PRD.md                # Product Requirements Document
```

### Gitignore Status

✅ **.gitignore** is correct geconfigureerd:

- `node_modules/` - Dependencies excluded
- `.next/` - Next.js build output excluded
- `.env*` - Environment files excluded (never commit)
- `.devcontainer-persist/` - Local settings excluded
- `*.log` - Log files excluded
- OS files excluded (`.DS_Store`, `Thumbs.db`)

## Branch Management

### Huidige Branch Status

🔴 **CRITICAL ISSUE** - Git commando's werken niet in huidige shell context

**Probleem:**

- Alle git commando's falen met exit code -1
- Geen output of error messages
- Repository status volledig onbekend
- Alle Git/GitHub operaties geblokkeerd

**Zie:** `REPOSITORY_PROBLEMS_REPORT.md` voor volledige diagnose en aanbevelingen

**Aanbevolen acties:**

1. ✅ **REPOSITORY_PROBLEMS_REPORT.md** gemaakt met volledige diagnose
2. ⏳ User verificatie vereist: Git installatie en repository status
3. ⏳ Fix terminal/shell issues
4. ⏳ Verifieer repository na fixes

### Branch Naming Conventions

- `feature/{description}` - New features
- `fix/{description}` - Bug fixes
- `hotfix/{critical}` - Emergency production fixes
- `refactor/{description}` - Code refactoring
- `docs/{description}` - Documentation updates

### Feature Branch Workflow

1. Create branch: `git checkout -b feature/description`
2. Make changes
3. Test locally: `npm run type-check && npm run build`
4. Stage changes: `git add .`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push origin feature/description`
7. Create PR on GitHub
8. Wait for pre-merge checks
9. Wait for Railway preview
10. Test preview
11. Merge when ALL checks pass

## PR & Merge Management

### Pre-Merge Checklist

Voor ELKE merge naar main:

- [ ] **GitHub Actions:**
  - [ ] Type check passes ✅
  - [ ] Build succeeds ✅
  - [ ] Railway config valid ✅
  - [ ] Dagger pipeline valid ✅

- [ ] **Railway Preview:**
  - [ ] Preview deployment successful ✅
  - [ ] Health endpoint responds ✅
  - [ ] No errors in logs ✅
  - [ ] All endpoints tested ✅

- [ ] **Code Quality:**
  - [ ] No debug code ✅
  - [ ] No console.logs ✅
  - [ ] TypeScript types correct ✅
  - [ ] Follows project structure ✅

- [ ] **Documentation:**
  - [ ] Tasklist.prd updated ✅
  - [ ] Commit messages clear ✅
  - [ ] PR description complete ✅

### Merge Process

**ONLY merge when ALL checks pass!**

1. Verify all GitHub Actions checks pass
2. Verify Railway preview works
3. Review code changes
4. Merge to main (squash or rebase)
5. Delete feature branch
6. Verify production deployment
7. Update Tasklist.prd

## Monitoring & Maintenance

### Daily Checks

1. **GitHub Actions Status:**
   - Check latest workflow runs
   - Verify all jobs pass
   - Review any failures

2. **Open PRs:**
   - Review PR status
   - Check pre-merge checks
   - Verify Railway previews

3. **Railway Deployments:**
   - Check production health
   - Review deployment logs
   - Verify all endpoints work

4. **Repository Status:**
   - Check current branch
   - Review uncommitted changes
   - Verify gitignore rules

### Weekly Maintenance

1. **Clean up merged branches:**

   ```bash
   git branch -d feature/merged-branch
   git push origin --delete feature/merged-branch
   ```

2. **Update main branch:**

   ```bash
   git checkout main
   git pull origin main
   ```

3. **Review Tasklist.prd:**
   - Update completed tasks
   - Add new todos
   - Review pending tasks

4. **Review GitHub Actions:**
   - Check workflow performance
   - Review failed runs
   - Optimize workflows if needed

## Emergency Procedures

### If Main Branch is Broken

1. Create hotfix branch: `git checkout -b hotfix/fix-main`
2. Fix the issue
3. Test: `npm run type-check && npm run build`
4. Push and create PR
5. Merge immediately after checks pass
6. Verify production

### If GitHub Actions Fails

1. Check workflow logs
2. Fix issue on feature branch
3. Push fix
4. Wait for re-run
5. Verify all checks pass

### If Railway Deployment Fails

1. Check Railway logs
2. Verify railway.json
3. Check environment variables
4. Fix on feature branch
5. Push and wait for redeploy
6. Verify preview works

## Tools & Commands Reference

### Git Commands

```bash
# Status
git status                    # Working directory status
git branch -a                 # All branches
git log --oneline -10         # Recent commits

# Branching
git checkout -b feature/name  # Create feature branch
git checkout main             # Switch to main
git branch -d feature/name    # Delete local branch

# Staging & Committing
git add .                     # Stage all
git add <file>                # Stage file
git status                    # Verify staged
git commit -m "message"       # Commit
git commit --amend            # Amend commit

# Pushing
git push origin branch-name   # Push branch
git push -u origin branch-name  # Push with upstream

# Diff & Review
git diff                      # Unstaged changes
git diff --staged             # Staged changes
git diff main..feature/name   # Compare branches
```

### Build & Test

```bash
npm run type-check            # TypeScript check
npm run build                 # Build app
npm run cicd:validate         # Full validation
```

## Next Steps

1. ✅ Git/GitHub workflow documentatie compleet
2. ⏳ Verificatie huidige git status (vereist shell access)
3. ⏳ Review open PRs en merge readiness
4. ⏳ Monitor GitHub Actions workflows
5. ⏳ Update Tasklist.prd met branch discipline task

## Resources

- **Workflow Documentatie:** `.cursor/rules/git-github-specialist.mdc`
- **Tasklist:** `Tasklist.prd`
- **PRD:** `PRD.md`
- **Monorepo Structuur:** `MONOREPO_STRUCTURE.md`
- **Gitignore:** `.gitignore`

---

**Status:** ✅ Git/GitHub Specialist workflow volledig geconfigureerd en gedocumenteerd

**Volgende actie:** Verificatie huidige repository status en PR review
