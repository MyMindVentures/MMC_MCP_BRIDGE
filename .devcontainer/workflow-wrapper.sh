#!/bin/bash
# Workflow Wrapper - Makes workflow scripts accessible from anywhere
# Usage: workflow-wrapper.sh <workflow-name> [args...]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOWS_DIR="${PROJECT_ROOT}/containers/e2e/workflows"

WORKFLOW_NAME="$1"
shift

if [ -z "$WORKFLOW_NAME" ]; then
    echo "Usage: $0 <workflow-name> [args...]"
    echo ""
    echo "Available workflows:"
    ls -1 "${WORKFLOWS_DIR}"/*.sh | xargs -n1 basename | sed 's/\.sh$//' | sed 's/^/  - /'
    exit 1
fi

WORKFLOW_SCRIPT="${WORKFLOWS_DIR}/${WORKFLOW_NAME}.sh"

if [ ! -f "$WORKFLOW_SCRIPT" ]; then
    echo "❌ Workflow not found: ${WORKFLOW_NAME}"
    echo ""
    echo "Available workflows:"
    ls -1 "${WORKFLOWS_DIR}"/*.sh | xargs -n1 basename | sed 's/\.sh$//' | sed 's/^/  - /'
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# Execute workflow script
exec bash "$WORKFLOW_SCRIPT" "$@"

