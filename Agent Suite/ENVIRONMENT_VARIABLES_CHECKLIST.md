# 🔐 Environment Variables Checklist

**Complete list of all environment variables required for MMC MCP Bridge**

---

## ✅ Core (Required)

| Variable             | Description                                                | Required   | Example                  |
| -------------------- | ---------------------------------------------------------- | ---------- | ------------------------ |
| `MCP_BRIDGE_API_KEY` | API key voor MCP Bridge authenticatie                      | ✅ **YES** | `sk-...`                 |
| `REDIS_URL`          | Redis connection string (voor agent queue & rate limiting) | ✅ **YES** | `redis://localhost:6379` |

---

## 🗄️ Databases (Optional)

| Variable                     | Description                  | Required    | Example                               |
| ---------------------------- | ---------------------------- | ----------- | ------------------------------------- |
| `POSTGRES_CONNECTION_STRING` | PostgreSQL connection string | ⚠️ Optional | `postgresql://user:pass@host:5432/db` |
| `MONGODB_CONNECTION_STRING`  | MongoDB connection string    | ⚠️ Optional | `mongodb://user:pass@host:27017/db`   |
| `SQLITE_DB_PATH`             | SQLite database file path    | ⚠️ Optional | `/data/db.sqlite`                     |

---

## 🤖 AI Services (Optional)

| Variable            | Description       | Required    | Example      |
| ------------------- | ----------------- | ----------- | ------------ |
| `OPENAI_API_KEY`    | OpenAI API key    | ⚠️ Optional | `sk-...`     |
| `ANTHROPIC_API_KEY` | Anthropic API key | ⚠️ Optional | `sk-ant-...` |

---

## 🛠️ Development Tools (Optional)

| Variable        | Description                  | Required    | Example   |
| --------------- | ---------------------------- | ----------- | --------- |
| `GITHUB_TOKEN`  | GitHub Personal Access Token | ⚠️ Optional | `ghp_...` |
| `RAILWAY_TOKEN` | Railway API token            | ⚠️ Optional | `...`     |

---

## 📊 Productivity Tools (Optional)

| Variable           | Description                    | Required    | Example      |
| ------------------ | ------------------------------ | ----------- | ------------ |
| `NOTION_API_KEY`   | Notion Integration Token       | ⚠️ Optional | `secret_...` |
| `SLACK_BOT_TOKEN`  | Slack Bot User OAuth Token     | ⚠️ Optional | `xoxb-...`   |
| `LINEAR_API_KEY`   | Linear API key                 | ⚠️ Optional | `...`        |
| `AIRTABLE_API_KEY` | Airtable Personal Access Token | ⚠️ Optional | `pat_...`    |

---

## 🔄 Automation Tools (Optional)

| Variable               | Description          | Required    | Example |
| ---------------------- | -------------------- | ----------- | ------- |
| `BRAVE_SEARCH_API_KEY` | Brave Search API key | ⚠️ Optional | `...`   |

---

## 🔗 Integration Tools (Optional)

| Variable               | Description                | Required    | Example                   |
| ---------------------- | -------------------------- | ----------- | ------------------------- |
| `N8N_INSTANCE_APIKEY`  | n8n API key                | ⚠️ Optional | `...`                     |
| `N8N_API_KEY`          | n8n API key (alternative)  | ⚠️ Optional | `...`                     |
| `N8N_BASE_URL`         | n8n instance URL           | ⚠️ Optional | `https://n8n.example.com` |
| `STRIPE_SECRET_KEY`    | Stripe Secret Key          | ⚠️ Optional | `sk_...`                  |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID     | ⚠️ Optional | `...`                     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ⚠️ Optional | `...`                     |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth Refresh Token | ⚠️ Optional | `...`                     |

---

## 🛠️ CLI Tools (Optional)

| Variable                   | Description                     | Required    | Example     |
| -------------------------- | ------------------------------- | ----------- | ----------- |
| `DOPPLER_TOKEN`            | Doppler API token               | ⚠️ Optional | `dp.st....` |
| `OP_SERVICE_ACCOUNT_TOKEN` | 1Password Service Account Token | ⚠️ Optional | `op://...`  |

---

## 📝 Notes

- **Required variables** must be set for core functionality
- **Optional variables** enable specific MCP servers
- Use **Doppler** or **1Password** for credential management
- Set variables in **Railway** dashboard for production
- Use `.env.local` for local development (not committed to git)

---

## ✅ Verification

Run verification script:

```powershell
npm run verify:external
```

Or check diagnostic endpoint:

```bash
curl http://localhost:3000/api/debug/diagnostic
```
