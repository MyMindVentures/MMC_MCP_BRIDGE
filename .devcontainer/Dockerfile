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
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Copy extension installation script
COPY .devcontainer/install-extensions.sh /usr/local/bin/install-extensions.sh
RUN chmod +x /usr/local/bin/install-extensions.sh

# Set working directory
WORKDIR /workspaces

# Set user
USER node
