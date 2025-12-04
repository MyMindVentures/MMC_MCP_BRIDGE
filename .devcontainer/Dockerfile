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
    redis-tools \
    postgresql-client \
    gnupg \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install PowerShell Core (pwsh) for Linux
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/repos/microsoft-debian-bullseye-prod bullseye main" > /etc/apt/sources.list.d/microsoft-prod.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends powershell \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Copy extension installation script
COPY .devcontainer/install-extensions.sh /usr/local/bin/install-extensions.sh
RUN chmod +x /usr/local/bin/install-extensions.sh

# Copy dev server startup script
COPY .devcontainer/start-dev.sh /usr/local/bin/start-dev.sh
RUN chmod +x /usr/local/bin/start-dev.sh

# Copy settings persistence script
COPY .devcontainer/persist-settings.sh /usr/local/bin/persist-settings.sh
RUN chmod +x /usr/local/bin/persist-settings.sh

# Copy todo sync script
COPY .devcontainer/sync-todos.sh /usr/local/bin/sync-todos.sh
RUN chmod +x /usr/local/bin/sync-todos.sh

# Set working directory
WORKDIR /workspaces

# Set user
USER node
