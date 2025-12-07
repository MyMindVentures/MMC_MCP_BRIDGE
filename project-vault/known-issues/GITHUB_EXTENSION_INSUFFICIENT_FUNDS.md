# GitHub Extension "Insufficient Funds" Error

**Date:** 2024-12-06  
**Status:** ⚠️ Known Issue - Solution Documented  
**Extension:** GitHub.vscode-pull-request-github / GitHub Extension

---

## 🚨 Probleem

**Error Message:**
```
Failed to run review: insufficient funds (request ID: a0577c86-5cef-4739-9d5f-e4504f3b0b59)
```

**Symptomen:**
- GitHub Extension "Review/Find Issues" functionaliteit faalt
- Error: "insufficient funds"
- Review features werken niet
- Find Issues features werken niet

**Betrokken Extensions:**
- `GitHub.vscode-pull-request-github` - Pull Request & Issue Management
- `GitHub.copilot` - GitHub Copilot (mogelijk gerelateerd)
- `GitHub.copilot-chat` - Copilot Chat (mogelijk gerelateerd)

---

## 🔍 Oorzaak

**Mogelijke Oorzaken:**

1. **GitHub Copilot Abonnement Issues:**
   - Copilot abonnement is verlopen
   - Geen credits meer beschikbaar
   - Abonnement niet actief

2. **GitHub API Rate Limits:**
   - GitHub API rate limit bereikt
   - Te veel requests naar GitHub API
   - Authenticatie problemen

3. **GitHub Extension Configuration:**
   - Extension probeert betaalde features te gebruiken
   - Authenticatie niet correct geconfigureerd
   - Extension settings problemen

4. **GitHub Account Issues:**
   - GitHub account heeft geen toegang tot betaalde features
   - Account verificatie problemen
   - Organization settings blokkeren features

---

## ✅ Oplossingen

### Oplossing 1: GitHub Copilot Abonnement Controleren

**Stappen:**

1. **Check GitHub Copilot Status:**
   - Ga naar: https://github.com/settings/copilot
   - Verifieer dat Copilot actief is
   - Check of er credits beschikbaar zijn

2. **Verifieer Abonnement:**
   - Check GitHub account settings
   - Verifieer betaald abonnement status
   - Check billing information

3. **Re-authenticate:**
   - Sign out van GitHub in Cursor/VS Code
   - Sign in opnieuw
   - Verifieer authenticatie

### Oplossing 2: GitHub Extension Settings Aanpassen

**Disable Betaalde Features (Workaround):**

1. **Open Settings:**
   - `Ctrl+,` (Windows) of `Cmd+,` (Mac)
   - Zoek naar "GitHub"

2. **Configure GitHub Extension Settings (Valid Settings):**
   ```json
   {
     "githubPullRequests.remotes": ["origin", "upstream"],
     "githubPullRequests.defaultMergeMethod": "merge",
     "githubPullRequests.fileListLayout": "tree",
     "githubIssues.useBranchForIssues": true
   }
   ```
   **Note:** There is NO `enabled` setting. To disable, uninstall the extension.

3. **Of gebruik alleen gratis features:**
   - Gebruik GitLens voor git features
   - Gebruik GitHub web interface voor PR reviews
   - Gebruik GitHub CLI voor issues

### Oplossing 3: GitHub Authenticatie Opnieuw Instellen

**Stappen:**

1. **Sign Out:**
   - Command Palette: `Ctrl+Shift+P` (Windows) of `Cmd+Shift+P` (Mac)
   - Type: "GitHub: Sign Out"
   - Sign out van alle GitHub accounts

2. **Sign In Opnieuw:**
   - Command Palette: `Ctrl+Shift+P`
   - Type: "GitHub: Sign In"
   - Volg authenticatie flow
   - Verifieer dat authenticatie succesvol is

3. **Check Permissions:**
   - Ga naar: https://github.com/settings/applications
   - Verifieer Cursor/VS Code permissions
   - Revoke en re-authorize indien nodig

### Oplossing 4: Extension Disable/Re-enable

**Stappen:**

1. **Disable Extension:**
   - Extensions view: `Ctrl+Shift+X`
   - Zoek: "GitHub Pull Requests and Issues"
   - Klik "Disable"

2. **Reload Window:**
   - Command Palette: `Ctrl+Shift+P`
   - Type: "Developer: Reload Window"

3. **Re-enable Extension:**
   - Extensions view
   - Klik "Enable" op GitHub Extension
   - Re-authenticate indien nodig

### Oplossing 5: Alternatieve Tools Gebruiken

**Gratis Alternatieven:**

1. **GitLens (Al geïnstalleerd):**
   - Git history en blame
   - Branch management
   - Commit details

2. **GitHub CLI (`gh`):**
   ```bash
   # Install GitHub CLI
   gh auth login
   
   # List issues
   gh issue list
   
   # View PRs
   gh pr list
   ```

3. **GitHub Web Interface:**
   - Gebruik browser voor PR reviews
   - GitHub Issues via web
   - GitHub Actions via web

---

## 📋 Verificatie

### Check GitHub Copilot Status

```bash
# Via GitHub CLI
gh api /user/copilot

# Of check in browser
# https://github.com/settings/copilot
```

### Check GitHub Authenticatie

```bash
# Via GitHub CLI
gh auth status

# Check in Cursor/VS Code
# Command Palette: "GitHub: Show Authentication Status"
```

### Test Extension

1. Open een GitHub repository
2. Probeer "Review" functionaliteit
3. Check of error nog steeds optreedt

---

## 🔧 Preventie

### Best Practices

1. **Monitor GitHub Copilot Usage:**
   - Check credits regelmatig
   - Monitor API usage
   - Set usage limits

2. **Use Free Alternatives:**
   - GitLens voor git features
   - GitHub CLI voor command-line
   - GitHub web voor reviews

3. **Keep Extensions Updated:**
   - Update GitHub Extension regelmatig
   - Check voor bug fixes
   - Report issues naar GitHub

4. **Backup Authentication:**
   - Save GitHub tokens securely
   - Use environment variables voor tokens
   - Document authentication setup

---

## 📝 Notes

- **GitHub Copilot is betaald:** Review features kunnen Copilot credits gebruiken
- **Free tier limitations:** Gratis GitHub accounts hebben beperkte API access
- **Extension dependencies:** GitHub Extension kan afhankelijk zijn van Copilot
- **Alternative tools:** GitLens en GitHub CLI zijn gratis alternatieven

---

## 🔗 Related

- **GitHub Copilot:** https://github.com/settings/copilot
- **GitHub API Limits:** https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
- **GitHub Extension Docs:** https://github.com/microsoft/vscode-pull-request-github
- **GitLens Docs:** https://gitlens.amod.io/
- **GitHub CLI Docs:** https://cli.github.com/

---

## 🎯 Quick Fix

**Snelle Workaround:**

1. **Uninstall Extension (if causing issues):**
   - Extensions view: `Ctrl+Shift+X`
   - Search: "GitHub Pull Requests and Issues"
   - Click "Uninstall"
   - Or configure valid settings (see Solution 2 above)

2. **Use GitLens Instead:**
   - GitLens is gratis en heeft veel features
   - Geen Copilot dependency

3. **Use GitHub CLI:**
   ```bash
   gh pr list
   gh issue list
   ```

---

**Last Updated:** 2024-12-06  
**Status:** ⚠️ Known Issue - Workarounds Available  
**Priority:** Medium - Feature limitation, not blocking
