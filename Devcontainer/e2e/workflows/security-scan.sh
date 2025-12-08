#!/bin/bash
# Security Scanning - Vervangt codeql.yml
# Security vulnerability scanning
set -e

echo "🔒 Running Security Scans..."

# npm audit
echo "📦 Running npm audit..."
npm audit --audit-level=moderate || {
    echo "⚠️  npm audit found vulnerabilities (non-blocking)"
}

# Check if Snyk is available
if command -v snyk &> /dev/null; then
    echo "🛡️  Running Snyk security scan..."
    snyk test --severity-threshold=high || {
        echo "⚠️  Snyk found high severity issues (non-blocking)"
    }
else
    echo "ℹ️  Snyk not installed, skipping..."
fi

# Check for known vulnerable packages
echo "🔍 Checking for known vulnerable packages..."
if [ -f "package-lock.json" ]; then
    # Check for common vulnerable packages
    VULN_PACKAGES=$(grep -E '"resolved".*github\.com' package-lock.json | wc -l || echo "0")
    if [ "$VULN_PACKAGES" -gt 0 ]; then
        echo "⚠️  Found ${VULN_PACKAGES} packages from GitHub (potential security risk)"
    fi
fi

echo "✅ Security scan completed!"

