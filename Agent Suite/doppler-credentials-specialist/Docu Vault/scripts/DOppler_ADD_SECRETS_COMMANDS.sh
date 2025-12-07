#!/bin/bash
# Doppler Add Secrets Commands
# Run these commands to add all secrets to Doppler
# Replace PLACEHOLDER with actual values

PROJECT="mmc-mcp-bridge"
CONFIGS=("dev" "staging" "production")

# List of all credentials
declare -a SECRETS=(
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
  "GITHUB_TOKEN"
  "LINEAR_API_KEY"
  "MONGODB_CONNECTION_STRING"
  "POSTGRES_CONNECTION_STRING"
  "SQLITE_DB_PATH"
  "NOTION_API_KEY"
  "SLACK_BOT_TOKEN"
  "AIRTABLE_API_KEY"
  "RAINDROP_TOKEN"
  "POSTMAN_API_KEY"
  "GOOGLE_DRIVE_CREDENTIALS"
  "STRAPI_URL"
  "STRAPI_API_KEY"
  "STRIPE_SECRET_KEY"
  "REDIS_URL"
  "SENTRY_DSN"
  "OLLAMA_BASE_URL"
  "BRAVE_SEARCH_API_KEY"
  "MCP_BRIDGE_API_KEY"
  "RAILWAY_TOKEN"
  "N8N_INSTANCE_APIKEY"
  "N8N_API_KEY"
  "N8N_BASE_URL"
)

echo "Adding secrets to Doppler..."
echo "Project: $PROJECT"
echo ""

for config in "${CONFIGS[@]}"; do
  echo "=== Config: $config ==="
  for secret in "${SECRETS[@]}"; do
    echo "doppler secrets set $secret=\"VALUE\" --project $PROJECT --config $config"
  done
  echo ""
done
