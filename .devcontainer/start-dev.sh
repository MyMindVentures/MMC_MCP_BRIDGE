#!/bin/bash
# Start Next.js dev server in background for hot reload
# This script runs on container start

cd /workspaces/MMC_MCP_BRIDGE || exit 1

# Check if dev server is already running
if pgrep -f "next dev" > /dev/null; then
  echo "✅ Next.js dev server is already running"
  exit 0
fi

# Start dev server in background
echo "🚀 Starting Next.js dev server in background..."
nohup npm run dev > /tmp/nextjs-dev.log 2>&1 &
DEV_PID=$!

# Save PID for later reference
echo $DEV_PID > /tmp/nextjs-dev.pid

echo "📝 Dev server PID: $DEV_PID"
echo "📝 Logs: tail -f /tmp/nextjs-dev.log"
echo "🌐 Server will be available at http://localhost:3000"
echo "🛑 To stop: kill $DEV_PID"

# Wait a moment for server to start
sleep 5

# Check if server is running
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Dev server is running and healthy!"
elif pgrep -f "next dev" > /dev/null; then
  echo "⏳ Dev server is starting... (check logs: tail -f /tmp/nextjs-dev.log)"
else
  echo "⚠️  Dev server may have failed to start. Check logs: tail -f /tmp/nextjs-dev.log"
fi

