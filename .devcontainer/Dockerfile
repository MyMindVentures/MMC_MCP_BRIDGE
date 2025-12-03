FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    ca-certificates \
    vim \
    nano \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy MOTD
COPY motd.txt /etc/motd

# Create dynamic environment helper scripts
RUN echo '#!/bin/bash' > /usr/local/bin/env-add && \
    echo 'if [ -z "$1" ] || [ -z "$2" ]; then' >> /usr/local/bin/env-add && \
    echo '  echo "Usage: env-add KEY VALUE"' >> /usr/local/bin/env-add && \
    echo '  echo "Example: env-add RAILWAY_API_KEY sk-xxx"' >> /usr/local/bin/env-add && \
    echo '  exit 1' >> /usr/local/bin/env-add && \
    echo 'fi' >> /usr/local/bin/env-add && \
    echo 'echo "$1=$2" >> /workspace/.env' >> /usr/local/bin/env-add && \
    echo 'echo "✅ Added $1 to .env"' >> /usr/local/bin/env-add && \
    chmod +x /usr/local/bin/env-add && \
    echo '#!/bin/bash' > /usr/local/bin/env-list && \
    echo 'if [ -f /workspace/.env ]; then' >> /usr/local/bin/env-list && \
    echo '  echo "📋 Current environment variables in .env:"' >> /usr/local/bin/env-list && \
    echo '  echo ""' >> /usr/local/bin/env-list && \
    echo '  cat /workspace/.env | grep -v "^#" | grep -v "^$"' >> /usr/local/bin/env-list && \
    echo 'else' >> /usr/local/bin/env-list && \
    echo '  echo "⚠️  No .env file found. Create one with: touch /workspace/.env"' >> /usr/local/bin/env-list && \
    echo 'fi' >> /usr/local/bin/env-list && \
    chmod +x /usr/local/bin/env-list && \
    echo '#!/bin/bash' > /usr/local/bin/env-edit && \
    echo 'if [ ! -f /workspace/.env ]; then' >> /usr/local/bin/env-edit && \
    echo '  touch /workspace/.env' >> /usr/local/bin/env-edit && \
    echo '  echo "# Environment Variables - Add your credentials here" > /workspace/.env' >> /usr/local/bin/env-edit && \
    echo '  echo "# Format: KEY=value (no spaces around =)" >> /workspace/.env' >> /usr/local/bin/env-edit && \
    echo '  echo "" >> /workspace/.env' >> /usr/local/bin/env-edit && \
    echo 'fi' >> /usr/local/bin/env-edit && \
    echo 'nano /workspace/.env' >> /usr/local/bin/env-edit && \
    chmod +x /usr/local/bin/env-edit && \
    echo '#!/bin/bash' > /usr/local/bin/env-load && \
    echo 'if [ -f /workspace/.env ]; then' >> /usr/local/bin/env-load && \
    echo '  export $(cat /workspace/.env | grep -v "^#" | xargs)' >> /usr/local/bin/env-load && \
    echo '  echo "✅ Environment variables loaded from .env"' >> /usr/local/bin/env-load && \
    echo 'else' >> /usr/local/bin/env-load && \
    echo '  echo "⚠️  No .env file found"' >> /usr/local/bin/env-load && \
    echo 'fi' >> /usr/local/bin/env-load && \
    chmod +x /usr/local/bin/env-load

# Auto-load .env on shell start
RUN echo '# Auto-load .env if it exists' >> /home/node/.bashrc && \
    echo 'if [ -f /workspace/.env ]; then' >> /home/node/.bashrc && \
    echo '  export $(cat /workspace/.env | grep -v "^#" | grep -v "^$" | xargs) 2>/dev/null' >> /home/node/.bashrc && \
    echo 'fi' >> /home/node/.bashrc

# Show MOTD and helper info on login
RUN echo 'cat /etc/motd' >> /home/node/.bashrc && \
    echo 'echo ""' >> /home/node/.bashrc && \
    echo 'echo "🔧 Environment Tools:"' >> /home/node/.bashrc && \
    echo 'echo "  env-edit  - Edit .env file (creates if not exists)"' >> /home/node/.bashrc && \
    echo 'echo "  env-add   - Add variable: env-add KEY VALUE"' >> /home/node/.bashrc && \
    echo 'echo "  env-list  - List all variables in .env"' >> /home/node/.bashrc && \
    echo 'echo "  env-load  - Manually reload .env variables"' >> /home/node/.bashrc && \
    echo 'echo ""' >> /home/node/.bashrc

# Set user
USER node




