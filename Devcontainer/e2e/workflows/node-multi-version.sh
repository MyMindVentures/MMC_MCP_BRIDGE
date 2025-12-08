#!/bin/bash
# Node.js Multi-Version Testing - Vervangt node.js.yml
# Test op meerdere Node versies (18.x, 20.x, 22.x)
set -e

NODE_VERSIONS=("18" "20" "22")
FAILED_VERSIONS=()

echo "🧪 Testing on multiple Node.js versions..."

for version in "${NODE_VERSIONS[@]}"; do
    echo ""
    echo "📦 Testing Node.js ${version}.x..."
    
    # Check if nvm is available, otherwise use node version manager
    if command -v nvm &> /dev/null; then
        nvm use "${version}" || {
            echo "⚠️  Node.js ${version} not available via nvm, skipping..."
            continue
        }
    else
        # Use n (node version manager) if available
        if command -v n &> /dev/null; then
            n "${version}" || {
                echo "⚠️  Node.js ${version} not available via n, skipping..."
                continue
            }
        else
            echo "⚠️  No node version manager found, testing with current version..."
        }
    fi
    
    # Verify Node version
    NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" != "$version" ]; then
        echo "⚠️  Current Node version is ${NODE_VER}, expected ${version}. Skipping..."
        continue
    fi
    
    # Run tests
    echo "🔨 Running build on Node.js ${version}..."
    npm run build || {
        echo "❌ Build failed on Node.js ${version}"
        FAILED_VERSIONS+=("${version}")
        continue
    }
    
    echo "✅ Node.js ${version} tests passed!"
done

if [ ${#FAILED_VERSIONS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Tests failed on Node.js versions: ${FAILED_VERSIONS[*]}"
    exit 1
fi

echo ""
echo "✅ All Node.js version tests passed!"

