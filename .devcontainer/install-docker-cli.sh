#!/bin/bash
# Install Docker CLI in running devcontainer (temporary until rebuild)
# This is a workaround script for when devcontainer hasn't been rebuilt yet

set -e

echo "🔧 Installing Docker CLI in running container..."

# Check if already installed
if command -v docker &> /dev/null; then
  echo "✅ Docker CLI is already installed"
  docker --version
  exit 0
fi

# Install lsb-release if not present
if ! command -v lsb_release &> /dev/null; then
  echo "📦 Installing lsb-release..."
  sudo apt-get update
  sudo apt-get install -y lsb-release
fi

# Install Docker CLI
echo "📦 Installing Docker CLI..."
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce-cli docker-compose-plugin

echo "✅ Docker CLI installed successfully!"
docker --version
docker compose version

# Test Docker connection (if socket is available)
if [ -S /var/run/docker.sock ]; then
  echo "🔌 Testing Docker connection..."
  if docker info > /dev/null 2>&1; then
    echo "✅ Docker connection successful!"
  else
    echo "⚠️  Docker socket found but connection failed. Is Docker Desktop running?"
  fi
else
  echo "⚠️  Docker socket not found. Please ensure Docker Desktop is running and socket is mounted."
fi



