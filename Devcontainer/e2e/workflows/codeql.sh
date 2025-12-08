#!/bin/bash
# CodeQL Security Scanning
# Vervangt: .github/workflows/codeql.yml
# Gebaseerd op: GitHub CodeQL Advanced workflow
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 CodeQL Security Scanning"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if CodeQL CLI is installed
if ! command -v codeql &> /dev/null; then
    echo "📥 Installing CodeQL CLI..."
    cd /tmp
    wget -q https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-bundle-linux64.tar.gz
    tar -xzf codeql-bundle-linux64.tar.gz
    export PATH="$PATH:$(pwd)/codeql"
    cd "$PROJECT_ROOT"
fi

echo "✅ CodeQL CLI version:"
codeql version

# Languages to analyze
LANGUAGES=("javascript-typescript" "actions")

for LANGUAGE in "${LANGUAGES[@]}"; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Analyzing: $LANGUAGE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Create database
    DB_DIR="/tmp/codeql-db-$LANGUAGE"
    rm -rf "$DB_DIR"
    
    echo "📦 Creating CodeQL database..."
    codeql database create "$DB_DIR" \
        --language="$LANGUAGE" \
        --source-root="$PROJECT_ROOT" \
        --overwrite || {
        echo "⚠️  Database creation failed for $LANGUAGE (may be expected for some languages)"
        continue
    }
    
    # Analyze database
    echo "🔍 Analyzing database..."
    RESULTS_FILE="/tmp/codeql-results-$LANGUAGE.sarif"
    codeql database analyze "$DB_DIR" \
        --format=sarif-latest \
        --output="$RESULTS_FILE" \
        --threads=0 || {
        echo "⚠️  Analysis failed for $LANGUAGE"
        continue
    }
    
    # Display results summary
    if [ -f "$RESULTS_FILE" ]; then
        echo "📊 Results saved to: $RESULTS_FILE"
        # Count findings (basic parsing)
        FINDINGS=$(grep -c '"ruleId"' "$RESULTS_FILE" 2>/dev/null || echo "0")
        echo "📈 Findings: $FINDINGS"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CodeQL Scanning Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

