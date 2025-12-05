#!/bin/bash
# Docker Configuration Validation Script
# Validates Docker setup without requiring Docker to be running
set -e

cd /workspaces/MMC_MCP_BRIDGE

echo "🔍 Validating Docker Configuration..."
echo ""

ERRORS=0
WARNINGS=0

# Check docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ docker-compose.yml not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ docker-compose.yml exists"
  
  # Check for required services
  if grep -q "dev:" docker-compose.yml; then
    echo "✅ Dev service configured"
  else
    echo "❌ Dev service missing"
    ERRORS=$((ERRORS + 1))
  fi
  
  if grep -q "app:" docker-compose.yml; then
    echo "✅ App service configured"
  else
    echo "❌ App service missing"
    ERRORS=$((ERRORS + 1))
  fi
  
  if grep -q "e2e:" docker-compose.yml; then
    echo "✅ E2E service configured"
  else
    echo "❌ E2E service missing"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check Dockerfiles
for container in dev app e2e; do
  DOCKERFILE="containers/$container/Dockerfile"
  if [ -f "$DOCKERFILE" ]; then
    echo "✅ $DOCKERFILE exists"
    
    # Check for required labels
    if grep -q "org.opencontainers.image" "$DOCKERFILE"; then
      echo "✅ $container: OCI labels present"
    else
      echo "⚠️  $container: OCI labels missing"
      WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for build args
    if grep -q "ARG VERSION" "$DOCKERFILE"; then
      echo "✅ $container: Build args configured"
    else
      echo "⚠️  $container: Build args missing"
      WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for healthcheck (dev and app only)
    if [ "$container" != "e2e" ]; then
      if grep -q "HEALTHCHECK" "$DOCKERFILE"; then
        echo "✅ $container: Health check configured"
      else
        echo "⚠️  $container: Health check missing"
        WARNINGS=$((WARNINGS + 1))
      fi
    fi
  else
    echo "❌ $DOCKERFILE not found"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check build scripts
for container in dev app e2e; do
  BUILD_SCRIPT="containers/$container/build.sh"
  if [ -f "$BUILD_SCRIPT" ]; then
    echo "✅ $BUILD_SCRIPT exists"
    
    # Check if script is executable
    if [ -x "$BUILD_SCRIPT" ]; then
      echo "✅ $container: Build script is executable"
    else
      echo "⚠️  $container: Build script not executable (run: chmod +x $BUILD_SCRIPT)"
      WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for required flags
    if grep -q "--tag" "$BUILD_SCRIPT" && grep -q "--push-hub" "$BUILD_SCRIPT" && grep -q "--push-ghcr" "$BUILD_SCRIPT"; then
      echo "✅ $container: Registry flags present"
    else
      echo "⚠️  $container: Registry flags missing"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo "❌ $BUILD_SCRIPT not found"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check .dockerignore
if [ -f ".dockerignore" ]; then
  echo "✅ .dockerignore exists"
  
  # Check for common patterns
  if grep -q "node_modules" .dockerignore; then
    echo "✅ .dockerignore: node_modules excluded"
  else
    echo "⚠️  .dockerignore: node_modules not excluded"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  if grep -q ".next" .dockerignore; then
    echo "✅ .dockerignore: .next excluded"
  else
    echo "⚠️  .dockerignore: .next not excluded"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "⚠️  .dockerignore not found (recommended for smaller builds)"
  WARNINGS=$((WARNINGS + 1))
fi

# Check package.json scripts
if [ -f "package.json" ]; then
  echo "✅ package.json exists"
  
  REQUIRED_SCRIPTS=("docker:build:all" "docker:tag:all" "docker:push:all:hub" "docker:push:all:ghcr" "docker:clean:all" "docker:validate:all")
  for script in "${REQUIRED_SCRIPTS[@]}"; do
    if grep -q "\"$script\"" package.json; then
      echo "✅ npm script: $script"
    else
      echo "⚠️  npm script missing: $script"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Errors: $ERRORS"
echo "⚠️  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All validations passed!"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Validation passed with warnings"
  exit 0
else
  echo "❌ Validation failed with $ERRORS error(s)"
  exit 1
fi
