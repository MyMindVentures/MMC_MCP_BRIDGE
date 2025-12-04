# Enterprise CI/CD Workflow - MANDATORY

## Workflow: IDE → GitHub → Railway

```
┌─────────────┐
│  Local Dev  │
│  (IDE)      │
└──────┬──────┘
       │
       │ 1. Write Code
       │ 2. npm run build (MUST succeed)
       │ 3. git commit
       ▼
┌─────────────┐
│   Feature   │
│   Branch    │
└──────┬──────┘
       │
       │ 4. git push origin feature/xxx
       ▼
┌─────────────┐
│   GitHub    │
│   Actions   │
└──────┬──────┘
       │
       │ 5. CI Runs:
       │    - npm ci
       │    - npm run build
       │    - TypeScript check
       │
       │ 6. If CI passes → Railway Preview Deploy
       ▼
┌─────────────┐
│   Railway   │
│   Preview   │
└──────┬──────┘
       │
       │ 7. Test Preview
       │ 8. If OK → Merge to main
       ▼
┌─────────────┐
│    Main     │
│   Branch    │
└──────┬──────┘
       │
       │ 9. Railway Production Deploy
       ▼
┌─────────────┐
│  Production │
└─────────────┘
```

## MANDATORY STEPS

### Step 1: Local Development
```bash
# ALWAYS test build before committing
npm run build

# If build fails → FIX IT → Don't commit
# If build succeeds → Continue
```

### Step 2: Create Feature Branch
```bash
git checkout -b feature/description
# or
git checkout -b fix/description
```

### Step 3: Commit & Push
```bash
git add -A
git commit -m "feat: description"
git push origin feature/description
```

### Step 4: GitHub Actions CI
- Automatically runs on push
- Checks: `npm ci`, `npm run build`, TypeScript
- **MUST pass before merging**

### Step 5: Railway Preview
- Automatically deploys feature branch
- Test: `https://your-app-pr-123.railway.app/api/health`
- **MUST be healthy before merging**

### Step 6: Merge to Main
- Only if CI passes AND preview works
- Railway auto-deploys main to production

## RULES

1. **NEVER commit if `npm run build` fails locally**
2. **NEVER merge if GitHub Actions CI fails**
3. **NEVER merge if Railway preview fails**
4. **Main branch MUST always build and deploy successfully**

