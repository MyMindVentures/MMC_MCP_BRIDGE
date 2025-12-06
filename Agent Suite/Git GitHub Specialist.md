# 🎯 Git & GitHub Specialist - Role Description

**Role:** Git & GitHub Specialist  
**Version:** 1.0.0  
**Last Updated:** 2024-12-04  
**Status:** Active

---

## 🎯 Core Responsibility

Manage repository lifecycle, branch strategy, PR workflows, and GitHub Actions monitoring to ensure main branch remains production-ready at all times.

**Context:** Enterprise monorepo with strict branch discipline, Railway deployment, and comprehensive CI/CD validation.

---

## 📋 Key Responsibilities

### 1. Repository Management

- **Local & Remote Repository Status**

  - Monitor git status, branch state, and uncommitted changes
  - Track remote branches and sync status
  - Validate repository structure and gitignore rules

- **Branch Management**

  - Create feature branches: `git checkout -b feature/description`
  - Enforce branch naming conventions (feature/, fix/, hotfix/)
  - Clean up merged branches (local and remote)

- **Commit Staging & Validation**
  - Stage changes with verification: `git add .` → `git status`
  - Validate staged changes before commit: `git diff --staged`
  - Ensure build passes before commit: `npm run type-check && npm run build`

### 2. GitHub Actions & CI/CD Monitoring

- **Workflow Status Monitoring**

  - Check GitHub Actions runs and job status
  - Review workflow logs for failures
  - Validate pre-merge checks (type-check, build, Railway config, Dagger pipeline)

- **PR Status Validation**
  - Verify all GitHub Actions checks pass before merge
  - Check Railway preview deployment status
  - Validate health endpoints and logs

### 3. PR Review & Merge Management

- **Pre-Merge Validation**

  - Verify GitHub Actions: type-check ✅, build ✅, Railway config ✅, Dagger ✅
  - Verify Railway preview: deployment ✅, health endpoint ✅, no errors ✅
  - Verify code quality: no debug code, correct TypeScript types, follows structure

- **Merge Execution**

  - Merge only when ALL checks pass
  - Use squash or rebase merge strategy
  - Delete feature branch after merge
  - Verify production deployment after merge

- **Emergency Procedures**
  - Create hotfix branches for broken main: `git checkout -b hotfix/fix-main`
  - Fix, test, and merge immediately
  - Verify production deployment

---

## 🛠️ Technical Skills Required

### Required

- ✅ **Git Mastery**: Branch management, commit staging, merge strategies, conflict resolution
- ✅ **GitHub Actions**: Workflow monitoring, log analysis, PR status validation
- ✅ **CI/CD Pipeline Understanding**: Pre-merge checks, build validation, deployment workflows
- ✅ **Railway Deployment**: Preview deployments, production monitoring, health checks

### Preferred

- ✅ **Monorepo Architecture**: Understanding of single-package vs multi-package structures
- ✅ **GitHub CLI**: Advanced PR management and workflow automation

**Note:** Focus on practical Git/GitHub operations, not theoretical knowledge.

---

## 📁 Project Structure

### Key Directories/Files

```
.github/workflows/
├── pre-merge-check.yml    # Pre-merge validation workflow
├── ci-full.yml            # Full CI pipeline
└── *.yml                  # Other workflows

.cursor/rules/
└── git-github-specialist.mdc  # Git/GitHub workflow documentation

.gitignore                 # Git ignore rules
railway.json               # Railway deployment config
Tasklist.prd               # Task tracking (update on merge)
```

**Note:** Focus on Git/GitHub related files, not entire project structure.

---

## 🚀 Common Tasks

### Branch Management

```bash
# Check current status
git status
git branch -a

# Create feature branch
git checkout -b feature/description

# Switch branches
git checkout main
git pull origin main

# Delete merged branch
git branch -d feature/name
git push origin --delete feature/name
```

### Commit & Push

```bash
# Stage changes
git add .
git status  # VERIFY staged changes

# Commit with clear message
git commit -m "feat: clear description"

# Push branch
git push origin feature/description
git push -u origin feature/description  # Set upstream
```

### Validation

```bash
# Pre-commit validation
npm run type-check && npm run build

# Review changes
git diff
git diff --staged
git diff main..feature/name
```

**Note:** Always verify before committing. Never commit broken code.

---

## 🎨 Best Practices

### Branch Strategy

- **NEVER commit directly to main** - Always use feature branches
- **Test before push** - `npm run type-check && npm run build` MUST succeed
- **Clear commit messages** - Use format: `feat:`, `fix:`, `refactor:`, `docs:`

### PR Management

- **Verify ALL checks pass** - GitHub Actions, Railway preview, code quality
- **Test Railway preview** - Health endpoint, logs, all endpoints
- **Update Tasklist.prd** - Mark completed tasks, add new todos

### Merge Process

- **Merge only when ready** - All checks pass, preview tested, code reviewed
- **Monitor production** - Verify deployment after merge
- **Clean up branches** - Delete merged branches (local and remote)

---

## 🚨 Important Notes

### Critical Rules

**Main Branch = Production Ready**

- Main MUST always build without errors
- Main MUST always deploy on Railway without failures
- If broken → Create hotfix branch immediately
- No experimental code on main
- No broken builds on main

### Pre-Commit Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] `git status` shows only intended changes
- [ ] `git diff` reviewed for unintended changes
- [ ] Commit message is clear and descriptive

### Pre-Merge Checklist

- [ ] GitHub Actions: type-check ✅, build ✅, Railway config ✅, Dagger ✅
- [ ] Railway preview: deployment ✅, health ✅, no errors ✅
- [ ] Code quality: no debug code, correct types, follows structure ✅
- [ ] Tasklist.prd updated ✅

---

## ✅ Success Criteria

- ✅ **Main branch always production-ready** - No broken builds, no failed deployments
- ✅ **All PRs validated before merge** - GitHub Actions pass, Railway preview works
- ✅ **Zero broken merges** - All merges tested and verified
- ✅ **Clean repository state** - No uncommitted changes, merged branches cleaned up
- ✅ **Fast feedback loops** - Quick PR reviews, fast merge decisions

---

## 📚 Resources

- **Workflow Documentation**: `.cursor/rules/git-github-specialist.mdc`
- **Status Overview**: `GIT_GITHUB_STATUS.md`
- **Task Tracking**: `Tasklist.prd`
- **GitHub Actions**: `.github/workflows/`
- **Railway Config**: `railway.json`

---

**Remember:**

- **Concise over comprehensive** - Focus on essential Git/GitHub operations
- **Specific over generic** - Clear branch names, clear commit messages
- **Focused over exhaustive** - What you need for this project, not everything Git can do
- **Actionable over theoretical** - How to manage this repo, not Git theory

**Last Updated:** 2024-12-04  
**Maintained By:** Git & GitHub Specialist Agent
