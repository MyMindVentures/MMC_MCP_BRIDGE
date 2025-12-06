#!/bin/bash
# SonarQube Code Analysis
# Vervangt: .github/workflows/sonarqube.yml
# Gebaseerd op: SonarQube Scan Action
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 SonarQube Code Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for required environment variables
if [ -z "$SONAR_TOKEN" ] || [ -z "$SONAR_HOST_URL" ] || [ -z "$SONAR_PROJECT_KEY" ]; then
    echo "⚠️  SonarQube not configured"
    echo "   Set SONAR_TOKEN, SONAR_HOST_URL, and SONAR_PROJECT_KEY environment variables"
    echo "   Skipping SonarQube analysis..."
    exit 0
fi

# Check if SonarQube Scanner is available
if ! command -v sonar-scanner &> /dev/null; then
    echo "📥 Installing SonarQube Scanner..."
    # Download SonarQube Scanner
    cd /tmp
    wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
    unzip -q sonar-scanner-cli-5.0.1.3006-linux.zip
    export PATH="$PATH:$(pwd)/sonar-scanner-5.0.1.3006-linux/bin"
    cd "$PROJECT_ROOT"
fi

echo "✅ SonarQube Scanner version:"
sonar-scanner --version || echo "⚠️  SonarQube Scanner not available"

# Create sonar-project.properties if it doesn't exist
SONAR_PROPS="$PROJECT_ROOT/sonar-project.properties"
if [ ! -f "$SONAR_PROPS" ]; then
    echo "📝 Creating sonar-project.properties..."
    cat > "$SONAR_PROPS" <<EOF
sonar.projectKey=$SONAR_PROJECT_KEY
sonar.sources=app
sonar.sourceEncoding=UTF-8
sonar.host.url=$SONAR_HOST_URL
sonar.login=$SONAR_TOKEN
EOF
fi

# Run SonarQube analysis
echo "🔍 Running SonarQube analysis..."
sonar-scanner \
    -Dsonar.projectKey="$SONAR_PROJECT_KEY" \
    -Dsonar.host.url="$SONAR_HOST_URL" \
    -Dsonar.login="$SONAR_TOKEN" \
    -Dsonar.sources=app \
    -Dsonar.sourceEncoding=UTF-8 || {
    echo "⚠️  SonarQube analysis failed"
    exit 0  # Non-blocking
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SonarQube Analysis Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

