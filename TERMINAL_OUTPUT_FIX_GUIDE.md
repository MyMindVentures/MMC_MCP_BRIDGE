# 🔧 Terminal Output Fix Guide - Cursor IDE

**Date:** 2024-12-07  
**Status:** ✅ Solutions Identified  
**Issue:** Terminal output not visible (but worked before)  
**Root Cause:** Known Cursor IDE bugs

---

## 🚨 Quick Fix (Most Common Solution)

### Fix 1: Delete workspaceStorage Folder

**This is the #1 solution that fixes terminal output for most users on Windows.**

**Steps:**
1. **Close Cursor IDE completely** (all windows)
2. **Navigate to:** `%APPDATA%\Cursor\User\workspaceStorage\`
   - Full path: `C:\Users\[YourUsername]\AppData\Roaming\Cursor\User\workspaceStorage\`
3. **Delete the entire `workspaceStorage` folder**
4. **Restart Cursor IDE**
5. **Test terminal output**

**Warning:** This will delete chat history. Backup if needed.

**Status:** ✅ Confirmed fix for Cursor v2.1.39+ (Windows 11)

---

## 🔍 Other Solutions

### Fix 2: Update Cursor IDE

**Check version:**
- Help → About Cursor
- Help → Check for Updates

**Update if available:**
- Many terminal output bugs fixed in recent updates
- Latest version usually has fixes

### Fix 3: PowerShell Profile Settings

**Problem:** `-NoExit` in PowerShell args may interfere with output capture

**Fix:** Remove `-NoExit` from PowerShell profile in Cursor settings

**Location:** Cursor Settings → Terminal → Profiles → PowerShell

**Change:**
```json
// Before
"args": ["-NoExit", "-Command", "..."]

// After
"args": ["-Command", "..."]
```

### Fix 4: Use Command Prompt

**Temporary workaround:**
- Switch default terminal to Command Prompt
- Test if output works with CMD
- If CMD works, issue is PowerShell-specific

---

## 📋 Diagnostic Script

**Run the fix script:**
```powershell
npm run fix:terminal
```

**Or directly:**
```powershell
pwsh -File ./scripts/fix-terminal-output.ps1
```

**Script will:**
1. Check Cursor version
2. Offer to delete workspaceStorage folder
3. Check PowerShell profile settings
4. Test terminal output

---

## 🎯 Known Cursor IDE Bugs

### Bug 1: Terminal Output Not Showing (Windows)
- **Versions:** Cursor v2.1.39+ (Windows 11)
- **Fix:** Delete workspaceStorage folder
- **Status:** ✅ Confirmed solution

### Bug 2: Commands Hanging
- **Versions:** After Cursor v1.0 update
- **Fix:** Update Cursor IDE
- **Status:** Fixed in recent updates

### Bug 3: PowerShell Parameter Issues
- **Versions:** All Windows versions
- **Fix:** Use Command Prompt or update Cursor
- **Status:** Partially fixed

---

## ✅ Verification

**After applying fixes, test with:**
```powershell
# Test 1: Simple output
Write-Host "Test Output"

# Test 2: Command output
docker ps

# Test 3: File output
docker ps > test.txt 2>&1; Get-Content test.txt
```

**Expected:** Output should be visible in terminal response

---

## 📝 Next Steps

1. **Try workspaceStorage fix first** (most common solution)
2. **Update Cursor IDE** if fix doesn't work
3. **Check PowerShell profile settings** (remove -NoExit)
4. **Test with Command Prompt** as workaround
5. **Report to Cursor** if none of the above work

---

**Last Updated:** 2024-12-07  
**Status:** ⚠️ Known Cursor IDE Bug - Solutions Available
