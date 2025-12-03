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

# Create helper script for environment setup
RUN echo '#!/bin/bash' > /usr/local/bin/setup-env && \
    echo 'echo "🔧 Setting up environment variables..."' >> /usr/local/bin/setup-env && \
    echo 'echo ""' >> /usr/local/bin/setup-env && \
    echo 'echo "Creating .env file in /workspace..."' >> /usr/local/bin/setup-env && \
    echo 'cat > /workspace/.env << "ENVEOF"' >> /usr/local/bin/setup-env && \
    echo '# Railway' >> /usr/local/bin/setup-env && \
    echo 'RAILWAY_API_KEY=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Redis (Required for Agent Tasks)' >> /usr/local/bin/setup-env && \
    echo 'REDIS_URL=redis://localhost:6379' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# AI Models' >> /usr/local/bin/setup-env && \
    echo 'ANTHROPIC_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'OPENAI_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'OLLAMA_BASE_URL=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Automation' >> /usr/local/bin/setup-env && \
    echo 'N8N_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'N8N_BASE_URL=' >> /usr/local/bin/setup-env && \
    echo 'PUPPETEER_EXECUTABLE_PATH=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Databases' >> /usr/local/bin/setup-env && \
    echo 'MONGODB_CONNECTION_STRING=' >> /usr/local/bin/setup-env && \
    echo 'POSTGRES_CONNECTION_STRING=' >> /usr/local/bin/setup-env && \
    echo 'SQLITE_DB_PATH=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Productivity' >> /usr/local/bin/setup-env && \
    echo 'AIRTABLE_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'LINEAR_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'NOTION_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'RAINDROP_API_KEY=' >> /usr/local/bin/setup-env && \
    echo 'POSTMAN_API_KEY=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Communication' >> /usr/local/bin/setup-env && \
    echo 'SLACK_BOT_TOKEN=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Storage' >> /usr/local/bin/setup-env && \
    echo 'GOOGLE_DRIVE_CREDENTIALS=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Development' >> /usr/local/bin/setup-env && \
    echo 'GITHUB_TOKEN=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Search' >> /usr/local/bin/setup-env && \
    echo 'BRAVE_SEARCH_API_KEY=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Security' >> /usr/local/bin/setup-env && \
    echo 'DOPPLER_API_KEY=' >> /usr/local/bin/setup-env && \
    echo '' >> /usr/local/bin/setup-env && \
    echo '# Monitoring' >> /usr/local/bin/setup-env && \
    echo 'SENTRY_DSN=' >> /usr/local/bin/setup-env && \
    echo 'ENVEOF' >> /usr/local/bin/setup-env && \
    echo 'echo ""' >> /usr/local/bin/setup-env && \
    echo 'echo "✅ .env file created at /workspace/.env"' >> /usr/local/bin/setup-env && \
    echo 'echo "📝 Edit it with: nano .env or vim .env"' >> /usr/local/bin/setup-env && \
    echo 'echo ""' >> /usr/local/bin/setup-env && \
    chmod +x /usr/local/bin/setup-env

# Show MOTD and helper info on login
RUN echo 'cat /etc/motd' >> /home/node/.bashrc && \
    echo 'echo ""' >> /home/node/.bashrc && \
    echo 'echo "💡 TIP: Run setup-env to create .env file with all variables"' >> /home/node/.bashrc && \
    echo 'echo ""' >> /home/node/.bashrc

# Set user
USER node




