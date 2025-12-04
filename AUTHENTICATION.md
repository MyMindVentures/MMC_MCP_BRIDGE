# 🔐 MCP BRIDGE AUTHENTICATION

## 🌟 INDUSTRY STANDARD SECURITY (2025)

Onze MCP Bridge gebruikt **enterprise-grade authentication** met:

✅ **API Keys** - Simpel, veilig, industry standard  
✅ **Bearer Token** - RFC 6750 compliant  
✅ **Rate Limiting** - Redis-based, per API key  
✅ **Multiple Keys** - Support voor verschillende clients  
✅ **Scopes** - Fine-grained permissions  
✅ **Audit Logging** - Alle requests worden gelogd  
✅ **Auto-fail-open** - Development mode zonder keys  

---

## 🚀 QUICK START

### 1️⃣ Geen API Key = Development Mode

Als je **geen** `MCP_BRIDGE_API_KEY` instelt, werkt de bridge **zonder authentication**:

```bash
# Railway: Geen env vars nodig voor development
curl https://mmcmcphttpbridge-production.up.railway.app/api/health
# ✅ Werkt zonder Authorization header
```

### 2️⃣ Met API Key = Production Mode

Zodra je een API key instelt, is authentication **verplicht**:

```bash
# Railway: Voeg env var toe
MCP_BRIDGE_API_KEY=mmc_prod_abc123xyz789

# Nu vereist elke request authentication:
curl -H "Authorization: Bearer mmc_prod_abc123xyz789" \
  https://mmcmcphttpbridge-production.up.railway.app/api/sse
```

---

## 🔑 RAILWAY ENVIRONMENT VARIABLES

### Optie 1: Enkele API Key (Simpel)

```bash
MCP_BRIDGE_API_KEY=mmc_prod_abc123xyz789
```

**Features:**
- ✅ Full access (scope: *)
- ✅ Rate limit: 1000 requests/minute
- ✅ Name: "primary"

### Optie 2: Multiple API Keys (Advanced)

```bash
# Primary key
MCP_BRIDGE_API_KEY=mmc_prod_abc123xyz789

# Additional keys (format: KEY:NAME:SCOPES:RATE_LIMIT)
MCP_BRIDGE_API_KEYS=mmc_cursor_def456:cursor:*:500,mmc_n8n_ghi789:n8n:github|openai:100,mmc_readonly_jkl012:readonly:health|servers:50
```

**Format:** `KEY:NAME:SCOPES:RATE_LIMIT`

**Examples:**
- `mmc_cursor_def456:cursor:*:500` - Cursor IDE, full access, 500 req/min
- `mmc_n8n_ghi789:n8n:github|openai:100` - n8n, alleen GitHub & OpenAI, 100 req/min
- `mmc_readonly_jkl012:readonly:health|servers:50` - Read-only, 50 req/min

### Optie 3: Redis voor Rate Limiting (Optional)

```bash
REDIS_URL=redis://default:password@redis-host:6379
```

**Features:**
- ✅ Distributed rate limiting
- ✅ Audit logging (last 10k requests)
- ✅ API key statistics

**Zonder Redis:**
- ⚠️ Rate limiting disabled
- ⚠️ Audit logging disabled
- ✅ Authentication werkt nog steeds

---

## 🎯 CLIENT CONFIGURATIE

### Cursor IDE

```json
{
  "mcpServers": {
    "MMC-MCP-Bridge": {
      "type": "sse",
      "url": "https://mmcmcphttpbridge-production.up.railway.app/api/sse",
      "headers": {
        "Authorization": "Bearer mmc_prod_abc123xyz789"
      }
    }
  }
}
```

### n8n MCP Client Node

```yaml
Credential Name: MMC-MCP-Bridge
Transport: HTTP Streamable
URL: https://mmcmcphttpbridge-production.up.railway.app/api/sse

Authentication: Generic Header Auth
Header Name: Authorization
Header Value: Bearer mmc_prod_abc123xyz789
```

### OpenWebUI

```javascript
const eventSource = new EventSource(
  'https://mmcmcphttpbridge-production.up.railway.app/api/sse',
  {
    headers: {
      'Authorization': 'Bearer mmc_prod_abc123xyz789'
    }
  }
);
```

### cURL

```bash
# SSE Stream
curl -H "Authorization: Bearer mmc_prod_abc123xyz789" \
  https://mmcmcphttpbridge-production.up.railway.app/api/sse

# Direct Tool Call
curl -X POST \
  -H "Authorization: Bearer mmc_prod_abc123xyz789" \
  -H "Content-Type: application/json" \
  -d '{"owner":"MyMindVentures"}' \
  https://mmcmcphttpbridge-production.up.railway.app/api/mcp/github/listRepos
```

---

## 📊 API KEY STATISTICS

### Admin Endpoint

```bash
curl -H "Authorization: Bearer mmc_prod_abc123xyz789" \
  https://mmcmcphttpbridge-production.up.railway.app/api/admin/stats
```

**Response:**
```json
{
  "status": "success",
  "timestamp": "2025-12-04T04:00:00.000Z",
  "apiKeys": [
    {
      "name": "primary",
      "scopes": ["*"],
      "rateLimit": 1000,
      "enabled": true,
      "currentRequests": 42
    },
    {
      "name": "cursor",
      "scopes": ["*"],
      "rateLimit": 500,
      "enabled": true,
      "currentRequests": 15
    }
  ]
}
```

---

## 🔒 SECURITY BEST PRACTICES

### 1️⃣ API Key Format

```
mmc_{environment}_{random}

Examples:
- mmc_prod_a1b2c3d4e5f6
- mmc_dev_x7y8z9w0v1u2
- mmc_staging_m3n4o5p6q7r8
```

### 2️⃣ Key Rotation

```bash
# Step 1: Add new key
MCP_BRIDGE_API_KEYS=mmc_prod_NEW_KEY:primary-v2:*:1000

# Step 2: Update clients to use new key

# Step 3: Remove old key
MCP_BRIDGE_API_KEY=  # Remove old primary key
```

### 3️⃣ Scopes

```bash
# Read-only access
mmc_readonly_abc:readonly:health|servers|resources:50

# GitHub only
mmc_github_def:github-bot:github:100

# AI services only
mmc_ai_ghi:ai-client:openai|anthropic:200

# Full access
mmc_admin_jkl:admin:*:1000
```

### 4️⃣ Rate Limiting

```bash
# Low-priority client
mmc_batch_abc:batch:*:10

# Normal client
mmc_app_def:app:*:100

# High-priority client
mmc_critical_ghi:critical:*:1000
```

---

## 🐛 TROUBLESHOOTING

### Error: "Missing Authorization header"

**Oplossing:**
```bash
# Add header to request
Authorization: Bearer <your-api-key>
```

### Error: "Invalid Authorization format"

**Oplossing:**
```bash
# Correct format:
Authorization: Bearer mmc_prod_abc123

# NIET:
Authorization: mmc_prod_abc123
Authorization: Token mmc_prod_abc123
```

### Error: "Invalid or expired API key"

**Oplossing:**
1. Check Railway env vars
2. Verify key format
3. Check for typos
4. Regenerate key if needed

### Error: "Rate limit exceeded"

**Oplossing:**
1. Wait 1 minute
2. Increase rate limit in env var
3. Use multiple API keys for different clients
4. Add Redis for distributed rate limiting

---

## 📈 MONITORING

### Health Check (No Auth Required)

```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/health
```

### Authenticated Endpoints

```bash
# Servers list
curl -H "Authorization: Bearer <key>" \
  https://mmcmcphttpbridge-production.up.railway.app/api/servers

# Resources list
curl -H "Authorization: Bearer <key>" \
  https://mmcmcphttpbridge-production.up.railway.app/api/resources

# Admin stats (primary key only)
curl -H "Authorization: Bearer <key>" \
  https://mmcmcphttpbridge-production.up.railway.app/api/admin/stats
```

---

## 🎯 PRODUCTION CHECKLIST

- [ ] Generate strong API keys (32+ characters)
- [ ] Add `MCP_BRIDGE_API_KEY` to Railway
- [ ] Add `REDIS_URL` for rate limiting (optional)
- [ ] Update Cursor IDE config with Authorization header
- [ ] Update n8n credentials with Bearer token
- [ ] Test authentication with curl
- [ ] Monitor `/api/admin/stats` for usage
- [ ] Set up key rotation schedule (every 90 days)
- [ ] Document keys in password manager
- [ ] Set up alerts for rate limit violations

---

## 🌟 WAAROM DEZE AUTHENTICATION?

### ✅ Industry Standard (2025)

- **OpenAI** - Bearer tokens
- **Anthropic** - API keys
- **GitHub** - Personal access tokens
- **Stripe** - Secret keys
- **Railway** - Project tokens

### ✅ RFC Compliant

- **RFC 6750** - Bearer Token Usage
- **RFC 6749** - OAuth 2.0 patterns
- **RFC 7519** - JWT (for future expansion)

### ✅ Enterprise Features

- Multiple keys per environment
- Fine-grained scopes
- Per-key rate limiting
- Audit logging
- Key rotation support
- Admin dashboard

---

## 🚀 READY FOR PRODUCTION!

✅ Authentication middleware created  
✅ All endpoints secured  
✅ Rate limiting implemented  
✅ Audit logging enabled  
✅ Admin dashboard available  
✅ Documentation complete  

**Start securing your MCP Bridge! 🔒**

