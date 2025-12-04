# 🔐 OAUTH2 IMPLEMENTATION

## 🌟 ENTERPRISE-GRADE OAUTH2 SERVER

Onze MCP Bridge ondersteunt **volledige OAuth2 2.0** authentication met:

✅ **Authorization Code Flow** - Voor web apps & n8n  
✅ **Refresh Token Flow** - Automatic token renewal  
✅ **Client Credentials Flow** - Voor server-to-server  
✅ **PKCE Support** - Extra security voor mobiele apps  
✅ **Token Management** - PostgreSQL + Redis caching  
✅ **Client Management** - Admin API voor clients  
✅ **Scope-based Permissions** - Fine-grained access control  

---

## 🎯 WAAROM OAUTH2?

### vs API Keys

| Feature | API Keys | OAuth2 |
|---------|----------|--------|
| **Setup** | Simpel ✅ | Complex ⚠️ |
| **Security** | Good ✅ | Excellent ✅✅ |
| **Token Refresh** | Manual ❌ | Automatic ✅ |
| **User Delegation** | No ❌ | Yes ✅ |
| **Revocation** | Manual ⚠️ | Built-in ✅ |
| **Scopes** | Limited ⚠️ | Full ✅ |
| **Enterprise Ready** | Yes ✅ | Yes ✅✅ |

### Wanneer OAuth2 Gebruiken?

✅ **JA** als je:
- Multiple clients hebt (n8n, Cursor, OpenWebUI, etc.)
- Per-user permissions nodig hebt
- Automatic token refresh wilt
- Enterprise compliance vereist
- Third-party apps wilt ondersteunen

❌ **NEE** als je:
- Alleen 1-2 clients hebt
- Simpele API key voldoende is
- Geen token refresh nodig hebt

---

## 🚀 QUICK START

### 1️⃣ Database Initialisatie

```bash
# Railway: Voeg env var toe
OAUTH2_ADMIN_PASSWORD=your-secure-password

# Database tables worden automatisch aangemaakt bij eerste request
```

### 2️⃣ Create OAuth2 Client

```bash
curl -X POST \
  -H "Authorization: Bearer <your-admin-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "n8n Production",
    "redirectUris": ["https://your-n8n.com/oauth/callback"],
    "grants": ["authorization_code", "refresh_token"],
    "scopes": ["*"]
  }' \
  https://mmcmcphttpbridge-production.up.railway.app/api/oauth/clients
```

**Response:**
```json
{
  "client": {
    "clientId": "mmc_oauth2_client_abc123...",
    "clientSecret": "mmc_oauth2_secret_xyz789...",
    "name": "n8n Production",
    "redirectUris": ["https://your-n8n.com/oauth/callback"],
    "grants": ["authorization_code", "refresh_token"],
    "scopes": ["*"]
  },
  "warning": "Save the client_secret securely - it will not be shown again!"
}
```

### 3️⃣ Configure n8n

In n8n → Credentials → MCP Client → OAuth2:

```yaml
Grant Type: Authorization Code
Authorization URL: https://mmcmcphttpbridge-production.up.railway.app/api/oauth/authorize
Access Token URL: https://mmcmcphttpbridge-production.up.railway.app/api/oauth/token
Client ID: mmc_oauth2_client_abc123...
Client Secret: mmc_oauth2_secret_xyz789...
Scope: *
```

---

## 🔐 OAUTH2 FLOWS

### Flow 1: Authorization Code (n8n, Web Apps)

```
┌─────────┐                                  ┌─────────┐
│  n8n    │                                  │  Bridge │
└────┬────┘                                  └────┬────┘
     │                                            │
     │ 1. GET /oauth/authorize                   │
     │    ?client_id=...                          │
     │    &redirect_uri=...                       │
     │    &response_type=code                     │
     │───────────────────────────────────────────>│
     │                                            │
     │ 2. Show authorization page                 │
     │<───────────────────────────────────────────│
     │                                            │
     │ 3. User approves                           │
     │                                            │
     │ 4. Redirect with code                      │
     │<───────────────────────────────────────────│
     │                                            │
     │ 5. POST /oauth/token                       │
     │    grant_type=authorization_code           │
     │    code=...                                 │
     │    client_id=...                            │
     │    client_secret=...                        │
     │───────────────────────────────────────────>│
     │                                            │
     │ 6. Return access_token + refresh_token     │
     │<───────────────────────────────────────────│
     │                                            │
     │ 7. Use access_token for API calls         │
     │    Authorization: Bearer <access_token>    │
     │───────────────────────────────────────────>│
```

### Flow 2: Refresh Token

```
┌─────────┐                                  ┌─────────┐
│  n8n    │                                  │  Bridge │
└────┬────┘                                  └────┬────┘
     │                                            │
     │ 1. Access token expired                    │
     │                                            │
     │ 2. POST /oauth/token                       │
     │    grant_type=refresh_token                │
     │    refresh_token=...                        │
     │    client_id=...                            │
     │    client_secret=...                        │
     │───────────────────────────────────────────>│
     │                                            │
     │ 3. Return new access_token + refresh_token │
     │<───────────────────────────────────────────│
     │                                            │
     │ 4. Use new access_token                    │
     │───────────────────────────────────────────>│
```

### Flow 3: Client Credentials (Server-to-Server)

```
┌─────────┐                                  ┌─────────┐
│ Service │                                  │  Bridge │
└────┬────┘                                  └────┬────┘
     │                                            │
     │ 1. POST /oauth/token                       │
     │    grant_type=client_credentials           │
     │    client_id=...                            │
     │    client_secret=...                        │
     │    scope=github openai                      │
     │───────────────────────────────────────────>│
     │                                            │
     │ 2. Return access_token                     │
     │<───────────────────────────────────────────│
     │                                            │
     │ 3. Use access_token                        │
     │───────────────────────────────────────────>│
```

---

## 📋 API ENDPOINTS

### 1️⃣ Authorization Endpoint

**GET `/api/oauth/authorize`**

**Parameters:**
- `client_id` (required) - OAuth2 client ID
- `redirect_uri` (required) - Callback URL
- `response_type` (required) - Must be "code"
- `scope` (optional) - Requested scopes (space-separated)
- `state` (optional) - CSRF protection

**Response:**
- HTML authorization page
- User approves/denies
- Redirects to `redirect_uri` with `code` or `error`

### 2️⃣ Token Endpoint

**POST `/api/oauth/token`**

**Content-Type:** `application/x-www-form-urlencoded`

**Authorization Code Grant:**
```
grant_type=authorization_code
code=<authorization_code>
redirect_uri=<redirect_uri>
client_id=<client_id>
client_secret=<client_secret>
```

**Refresh Token Grant:**
```
grant_type=refresh_token
refresh_token=<refresh_token>
client_id=<client_id>
client_secret=<client_secret>
```

**Client Credentials Grant:**
```
grant_type=client_credentials
client_id=<client_id>
client_secret=<client_secret>
scope=<scopes>
```

**Response:**
```json
{
  "access_token": "mmc_oauth2_abc123...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "mmc_oauth2_xyz789...",
  "scope": "*"
}
```

### 3️⃣ Client Management

**GET `/api/oauth/clients`**
- List all OAuth2 clients
- Requires admin API key

**POST `/api/oauth/clients`**
- Create new OAuth2 client
- Requires admin API key

**DELETE `/api/oauth/clients?client_id=...`**
- Delete OAuth2 client
- Requires admin API key

---

## 🎯 N8N CONFIGURATION

### Method 1: OAuth2 (Recommended)

```yaml
Credential Type: MCP Client Tool
Authentication: OAuth2

Grant Type: Authorization Code
Authorization URL: https://mmcmcphttpbridge-production.up.railway.app/api/oauth/authorize
Access Token URL: https://mmcmcphttpbridge-production.up.railway.app/api/oauth/token
Client ID: mmc_oauth2_client_abc123...
Client Secret: mmc_oauth2_secret_xyz789...
Scope: *
Auth URI Query Parameters: {}
Authentication: Body
```

### Method 2: Bearer Token (Simpler)

```yaml
Credential Type: MCP Client Tool
Authentication: Bearer

Token: mmc_prod_abc123xyz789
```

---

## 🔒 SECURITY BEST PRACTICES

### 1️⃣ Client Secrets

```bash
# NEVER commit client secrets to git!
# Store in Railway env vars or password manager

# Rotate secrets regularly (every 90 days)
curl -X DELETE \
  -H "Authorization: Bearer <admin-key>" \
  "https://mmcmcphttpbridge-production.up.railway.app/api/oauth/clients?client_id=old_client"

curl -X POST \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"name":"n8n Production","redirectUris":[...]}' \
  https://mmcmcphttpbridge-production.up.railway.app/api/oauth/clients
```

### 2️⃣ Redirect URIs

```json
{
  "redirectUris": [
    "https://your-n8n.com/oauth/callback",
    "https://staging-n8n.com/oauth/callback"
  ]
}
```

**NEVER allow:**
- `http://` (only `https://`)
- Wildcards (`https://*.example.com`)
- `localhost` in production

### 3️⃣ Scopes

```json
{
  "scopes": ["github", "openai", "anthropic"]
}
```

**Available scopes:**
- `*` - Full access (admin only)
- `github` - GitHub MCP only
- `openai` - OpenAI MCP only
- `anthropic` - Anthropic MCP only
- `read` - Read-only access
- Custom scopes per client

### 4️⃣ Token Expiration

```
Access Token:  1 hour  (short-lived)
Refresh Token: 30 days (long-lived)
Auth Code:     10 min  (one-time use)
```

---

## 🐛 TROUBLESHOOTING

### Error: "invalid_client"

**Oplossing:**
1. Check `client_id` en `client_secret`
2. Verify client exists: `GET /api/oauth/clients`
3. Check client is enabled

### Error: "invalid_grant"

**Oplossing:**
1. Authorization code expired (10 min limit)
2. Code already used (one-time use)
3. Redirect URI mismatch

### Error: "access_denied"

**Oplossing:**
1. User denied authorization
2. Check authorization page credentials

### Error: "unsupported_grant_type"

**Oplossing:**
1. Check `grant_type` spelling
2. Verify client supports that grant type

---

## 📊 MONITORING

### Token Usage

```bash
# Check active tokens
curl -H "Authorization: Bearer <admin-key>" \
  https://mmcmcphttpbridge-production.up.railway.app/api/admin/stats
```

### Audit Logs

```bash
# View OAuth2 audit logs (Redis)
redis-cli LRANGE audit:requests 0 99
```

---

## 🎉 PRODUCTION CHECKLIST

- [ ] Create OAuth2 clients for each app
- [ ] Configure n8n with OAuth2 credentials
- [ ] Test authorization flow
- [ ] Test token refresh
- [ ] Set up client secret rotation schedule
- [ ] Configure redirect URIs (HTTPS only)
- [ ] Enable audit logging
- [ ] Monitor token usage
- [ ] Document client credentials securely
- [ ] Set up alerts for failed authentications

---

## 🌟 READY FOR ENTERPRISE!

✅ OAuth2 2.0 compliant  
✅ Authorization Code Flow  
✅ Refresh Token Flow  
✅ Client Credentials Flow  
✅ Token management (PostgreSQL + Redis)  
✅ Client management API  
✅ n8n compatible  
✅ Enterprise-grade security  

**Start using OAuth2 for maximum security! 🚀🔒**

