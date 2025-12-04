# 🔐 OAuth2 Setup voor n8n AI Agent

Complete gids om je n8n AI Agent te verbinden met de MMC MCP Bridge via OAuth2.

---

## 📋 Vereisten

- ✅ Railway deployment is healthy
- ✅ PostgreSQL database is geconfigureerd (`DATABASE_URL`)
- ✅ Redis is geconfigureerd (`REDIS_URL`) - optioneel maar aanbevolen
- ✅ Admin API key is ingesteld (`MCP_BRIDGE_API_KEY`)
- ✅ n8n instance draait (Railway of lokaal)

---

## 🚀 Snelle Start

### **Stap 1: Wacht tot Railway Healthy is**

```bash
# Check health status
curl https://mmcmcphttpbridge-production.up.railway.app/api/health

# Expected response:
# {"status":"healthy","timestamp":"2024-12-04T...","servers":{"enabled":26,...}}
```

### **Stap 2: Maak OAuth2 Client aan**

```bash
# Optie A: Met het script (aanbevolen)
./scripts/create-oauth2-client.sh \
  https://jouw-n8n-instance.railway.app \
  jouw-admin-api-key

# Optie B: Handmatig via curl
curl -X POST \
  -H "Authorization: Bearer jouw-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "n8n AI Agent",
    "redirectUris": [
      "https://jouw-n8n-instance.railway.app/rest/oauth2-credential/callback"
    ],
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
    "name": "n8n AI Agent",
    "redirectUris": ["https://..."],
    "grants": ["authorization_code", "refresh_token"],
    "scopes": ["*"]
  },
  "warning": "⚠️ Save the client_secret securely - it will not be shown again!"
}
```

⚠️ **BELANGRIJK:** Sla `clientId` en `clientSecret` veilig op!

---

## 🎯 n8n Configuratie

### **Stap 1: Nieuwe Credential Aanmaken**

1. Open n8n: `https://jouw-n8n-instance.railway.app`
2. Ga naar: **Credentials** → **Add Credential**
3. Zoek: **"OAuth2 API"** (of "HTTP Request" met OAuth2)
4. Kies: **Generic OAuth2 API**

### **Stap 2: OAuth2 Instellingen**

```yaml
Credential Name: MMC-MCP-Bridge-OAuth2

# Grant Type
Grant Type: Authorization Code

# URLs
Authorization URL: https://mmcmcphttpbridge-production.up.railway.app/api/oauth/authorize
Access Token URL: https://mmcmcphttpbridge-production.up.railway.app/api/oauth/token

# Client Credentials
Client ID: mmc_oauth2_client_abc123...
Client Secret: mmc_oauth2_secret_xyz789...

# Scope
Scope: *

# Authentication
Authentication: Body
Auth URI Query Parameters: {}
```

### **Stap 3: Connectie Testen**

1. Klik op **"Connect my account"**
2. Je wordt doorgestuurd naar de authorization page
3. Klik op **"Authorize"**
4. Je wordt teruggestuurd naar n8n
5. Status moet **"Connected"** zijn ✅

---

## 🤖 n8n Workflow Voorbeeld

### **Voorbeeld 1: MCP Tool Aanroepen**

```json
{
  "nodes": [
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "credentials": {
        "oAuth2Api": {
          "id": "1",
          "name": "MMC-MCP-Bridge-OAuth2"
        }
      },
      "parameters": {
        "method": "POST",
        "url": "https://mmcmcphttpbridge-production.up.railway.app/api/mcp/postgres/query",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "query",
              "value": "SELECT * FROM users LIMIT 10"
            }
          ]
        },
        "options": {}
      }
    }
  ]
}
```

### **Voorbeeld 2: AI Agent met MCP Tools**

```json
{
  "nodes": [
    {
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "agent": "openAIFunctionsAgent",
        "tools": ["mcpTool1", "mcpTool2"],
        "text": "={{ $json.userMessage }}"
      }
    },
    {
      "name": "MCP Tool - Postgres Query",
      "type": "n8n-nodes-base.httpRequest",
      "credentials": {
        "oAuth2Api": {
          "id": "1",
          "name": "MMC-MCP-Bridge-OAuth2"
        }
      },
      "parameters": {
        "method": "POST",
        "url": "https://mmcmcphttpbridge-production.up.railway.app/api/sse",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "method",
              "value": "tools/call"
            },
            {
              "name": "params",
              "value": {
                "name": "postgres_query",
                "arguments": {
                  "query": "={{ $json.query }}"
                }
              }
            }
          ]
        }
      }
    }
  ]
}
```

---

## 🔧 Troubleshooting

### **Probleem 1: "Application failed to respond"**

```bash
# Check Railway logs
railway logs

# Check health endpoint
curl https://mmcmcphttpbridge-production.up.railway.app/api/health
```

**Oplossing:** Wacht tot deployment compleet is (kan 2-5 minuten duren)

---

### **Probleem 2: "Invalid client credentials"**

**Oorzaken:**
- Client ID of Secret is verkeerd
- Client bestaat niet in database
- Database connectie mislukt

**Oplossing:**
```bash
# Verifieer dat client bestaat
curl -X GET \
  -H "Authorization: Bearer jouw-admin-api-key" \
  https://mmcmcphttpbridge-production.up.railway.app/api/oauth/clients

# Maak nieuwe client aan
./scripts/create-oauth2-client.sh
```

---

### **Probleem 3: "Redirect URI mismatch"**

**Oorzaak:** De redirect URI in n8n komt niet overeen met de geregistreerde URI

**Oplossing:**
```bash
# Check je n8n OAuth callback URL
echo "https://jouw-n8n-instance.railway.app/rest/oauth2-credential/callback"

# Update client met correcte redirect URI
curl -X POST \
  -H "Authorization: Bearer jouw-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "n8n AI Agent",
    "redirectUris": ["https://correcte-url.railway.app/rest/oauth2-credential/callback"]
  }' \
  https://mmcmcphttpbridge-production.up.railway.app/api/oauth/clients
```

---

### **Probleem 4: "Token expired"**

**Oorzaak:** Access token is verlopen (standaard 1 uur)

**Oplossing:** n8n refresht automatisch de token via de refresh token. Als dit niet werkt:

```bash
# Disconnect en reconnect in n8n
# Of maak nieuwe credential aan
```

---

## 📊 OAuth2 Flow Diagram

```
┌─────────┐                                  ┌──────────────┐
│  n8n    │                                  │  MCP Bridge  │
│ Client  │                                  │   (OAuth2)   │
└────┬────┘                                  └──────┬───────┘
     │                                              │
     │ 1. Authorization Request                    │
     ├─────────────────────────────────────────────>│
     │    GET /api/oauth/authorize                  │
     │    ?client_id=...&redirect_uri=...           │
     │                                              │
     │ 2. Authorization Page (HTML)                │
     │<─────────────────────────────────────────────┤
     │                                              │
     │ 3. User Authorizes                          │
     ├─────────────────────────────────────────────>│
     │    POST /api/oauth/authorize                 │
     │                                              │
     │ 4. Redirect with Code                       │
     │<─────────────────────────────────────────────┤
     │    302 redirect_uri?code=...                 │
     │                                              │
     │ 5. Token Exchange                           │
     ├─────────────────────────────────────────────>│
     │    POST /api/oauth/token                     │
     │    code=...&grant_type=authorization_code    │
     │                                              │
     │ 6. Access Token + Refresh Token             │
     │<─────────────────────────────────────────────┤
     │    { access_token, refresh_token, ... }      │
     │                                              │
     │ 7. API Request with Token                   │
     ├─────────────────────────────────────────────>│
     │    POST /api/sse                             │
     │    Authorization: Bearer access_token        │
     │                                              │
     │ 8. API Response                             │
     │<─────────────────────────────────────────────┤
     │                                              │
```

---

## 🔐 Beveiligingsinstellingen

### **Token Expiration**

```typescript
// In app/api/oauth/model.ts
const ACCESS_TOKEN_LIFETIME = 3600;      // 1 hour
const REFRESH_TOKEN_LIFETIME = 1209600;  // 14 days
const AUTH_CODE_LIFETIME = 600;          // 10 minutes
```

### **Scopes**

```typescript
// Beschikbare scopes:
'*'              // Alle tools
'postgres:*'     // Alleen Postgres tools
'openai:*'       // Alleen OpenAI tools
'read'           // Alleen read operations
'write'          // Alleen write operations
```

### **Rate Limiting**

```typescript
// Via Redis (automatisch)
- 100 requests per minute per client
- 1000 requests per hour per client
```

---

## 📚 API Endpoints

### **1. Create Client**
```bash
POST /api/oauth/clients
Authorization: Bearer admin-api-key
Content-Type: application/json

{
  "name": "Client Name",
  "redirectUris": ["https://..."],
  "grants": ["authorization_code", "refresh_token"],
  "scopes": ["*"]
}
```

### **2. List Clients**
```bash
GET /api/oauth/clients
Authorization: Bearer admin-api-key
```

### **3. Delete Client**
```bash
DELETE /api/oauth/clients
Authorization: Bearer admin-api-key
Content-Type: application/json

{
  "clientId": "mmc_oauth2_client_..."
}
```

### **4. Authorize**
```bash
GET /api/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=*
```

### **5. Token Exchange**
```bash
POST /api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=...&redirect_uri=...&client_id=...&client_secret=...
```

### **6. Refresh Token**
```bash
POST /api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=...&client_id=...&client_secret=...
```

---

## ✅ Checklist

- [ ] Railway deployment is healthy
- [ ] PostgreSQL database is verbonden
- [ ] Redis is verbonden (optioneel)
- [ ] Admin API key is ingesteld
- [ ] OAuth2 client is aangemaakt
- [ ] Client ID + Secret zijn opgeslagen
- [ ] n8n credential is geconfigureerd
- [ ] OAuth2 authorization is succesvol
- [ ] Test API call werkt
- [ ] AI Agent kan MCP tools gebruiken

---

## 🎉 Klaar!

Je n8n AI Agent kan nu via OAuth2 communiceren met de MMC MCP Bridge en alle 26 MCP servers gebruiken! 🚀

**Volgende stappen:**
1. Bouw je eerste AI workflow met MCP tools
2. Test verschillende MCP servers (Postgres, OpenAI, GitHub, etc.)
3. Integreer met OpenWebUI voor NLP-based workflow building
4. Monitor usage via `/api/admin/stats`

**Vragen?** Check de [OAUTH2.md](./OAUTH2.md) voor meer details!

