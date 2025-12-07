FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Test build context
RUN echo "=== BUILD CONTEXT TEST ===" && \
    pwd && \
    ls -la . 2>&1 | head -30 && \
    echo "=== CHECKING .devcontainer ===" && \
    ls -la .devcontainer 2>&1 || echo ".devcontainer NOT FOUND" && \
    echo "=== CHECKING package.json ===" && \
    ls -la package.json 2>&1 || echo "package.json NOT FOUND"

# Try to copy files
COPY .devcontainer/devcontainer.sh /tmp/test-devcontainer.sh 2>&1 || echo "COPY FAILED"
COPY package.json /tmp/test-package.json 2>&1 || echo "COPY FAILED"

RUN ls -la /tmp/test-* 2>&1 || echo "NO TEST FILES COPIED"
