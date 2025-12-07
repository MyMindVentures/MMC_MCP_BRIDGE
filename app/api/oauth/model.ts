// OAuth2 Server Model Implementation
// Implements the required interface for oauth2-server
// Stores tokens in PostgreSQL + Redis for performance

import { Pool } from "pg";
import { Redis } from "ioredis";

// PostgreSQL connection (reuse existing pool)
let pgPool: Pool | null = null;

export function getPgPool(): Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize OAuth2 tables on first connection
    initializeOAuth2Tables().catch((err) => {
      console.error("Failed to initialize OAuth2 tables:", err);
    });
  }
  return pgPool;
}

// Initialize OAuth2 database tables
async function initializeOAuth2Tables(): Promise<void> {
  const pool = getPgPool();

  try {
    // Create oauth2_clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oauth2_clients (
        client_id VARCHAR(255) PRIMARY KEY,
        client_secret VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        redirect_uris TEXT[] NOT NULL,
        grants TEXT[] NOT NULL,
        scopes TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create oauth2_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oauth2_tokens (
        access_token VARCHAR(255) PRIMARY KEY,
        access_token_expires_at TIMESTAMP NOT NULL,
        refresh_token VARCHAR(255) UNIQUE,
        refresh_token_expires_at TIMESTAMP,
        client_id VARCHAR(255) NOT NULL REFERENCES oauth2_clients(client_id) ON DELETE CASCADE,
        user_id VARCHAR(255),
        scopes TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create oauth2_authorization_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oauth2_authorization_codes (
        code VARCHAR(255) PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL,
        redirect_uri TEXT NOT NULL,
        client_id VARCHAR(255) NOT NULL REFERENCES oauth2_clients(client_id) ON DELETE CASCADE,
        user_id VARCHAR(255),
        scopes TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_oauth2_tokens_client_id ON oauth2_tokens(client_id);
      CREATE INDEX IF NOT EXISTS idx_oauth2_tokens_refresh_token ON oauth2_tokens(refresh_token);
      CREATE INDEX IF NOT EXISTS idx_oauth2_tokens_expires_at ON oauth2_tokens(access_token_expires_at);
      CREATE INDEX IF NOT EXISTS idx_oauth2_codes_client_id ON oauth2_authorization_codes(client_id);
      CREATE INDEX IF NOT EXISTS idx_oauth2_codes_expires_at ON oauth2_authorization_codes(expires_at);
    `);

    console.log("✅ OAuth2 database tables initialized");
  } catch (error) {
    console.error("❌ Failed to initialize OAuth2 tables:", error);
    throw error;
  }
}

// Redis connection (reuse existing)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }
  return redis;
}

// OAuth2 Client interface
export interface OAuth2Client {
  id: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  grants: string[];
  scopes: string[];
  name: string;
  enabled: boolean;
}

// OAuth2 Token interface
export interface OAuth2Token {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  client: OAuth2Client;
  user: OAuth2User;
}

// OAuth2 User interface
export interface OAuth2User {
  id: string;
  username: string;
  email?: string;
}

// OAuth2 Authorization Code interface
export interface OAuth2AuthorizationCode {
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  scope?: string;
  client: OAuth2Client;
  user: OAuth2User;
}

// Get client by clientId
export async function getClient(
  clientId: string,
  clientSecret?: string,
): Promise<OAuth2Client | null> {
  const pool = getPgPool();

  const query = clientSecret
    ? "SELECT * FROM oauth2_clients WHERE client_id = $1 AND client_secret = $2 AND enabled = true"
    : "SELECT * FROM oauth2_clients WHERE client_id = $1 AND enabled = true";

  const params = clientSecret ? [clientId, clientSecret] : [clientId];

  const result = await pool.query(query, params);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id.toString(),
    clientId: row.client_id,
    clientSecret: row.client_secret,
    redirectUris: row.redirect_uris,
    grants: row.grants,
    scopes: row.scopes,
    name: row.name,
    enabled: row.enabled,
  };
}

// Save token
export async function saveToken(
  token: any,
  client: any,
  user: any,
): Promise<OAuth2Token> {
  const pool = getPgPool();
  const redisClient = getRedis();

  await pool.query(
    `INSERT INTO oauth2_tokens 
     (access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, scope, client_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      token.accessToken,
      token.accessTokenExpiresAt,
      token.refreshToken || null,
      token.refreshTokenExpiresAt || null,
      token.scope || null,
      client.clientId,
      user.id,
    ],
  );

  // Cache in Redis for fast lookups
  if (redisClient) {
    const tokenData = {
      accessToken: token.accessToken,
      scope: token.scope,
      clientId: client.clientId,
      userId: user.id,
    };
    await redisClient.setex(
      `oauth2:token:${token.accessToken}`,
      3600, // 1 hour cache
      JSON.stringify(tokenData),
    );
  }

  return {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    scope: token.scope,
    client,
    user,
  };
}

// Get access token
export async function getAccessToken(
  accessToken: string,
): Promise<OAuth2Token | null> {
  const redisClient = getRedis();

  // Try Redis cache first
  if (redisClient) {
    const cached = await redisClient.get(`oauth2:token:${accessToken}`);
    if (cached) {
      const data = JSON.parse(cached);
      const client = await getClient(data.clientId);
      if (client) {
        return {
          accessToken: data.accessToken,
          accessTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
          scope: data.scope,
          client,
          user: { id: data.userId, username: data.userId },
        };
      }
    }
  }

  // Fallback to database
  const pool = getPgPool();
  const result = await pool.query(
    "SELECT * FROM oauth2_tokens WHERE access_token = $1",
    [accessToken],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const client = await getClient(row.client_id);

  if (!client) return null;

  return {
    accessToken: row.access_token,
    accessTokenExpiresAt: row.access_token_expires_at,
    refreshToken: row.refresh_token,
    refreshTokenExpiresAt: row.refresh_token_expires_at,
    scope: row.scope,
    client,
    user: { id: row.user_id, username: row.user_id },
  };
}

// Get refresh token
export async function getRefreshToken(
  refreshToken: string,
): Promise<OAuth2Token | null> {
  const pool = getPgPool();
  const result = await pool.query(
    "SELECT * FROM oauth2_tokens WHERE refresh_token = $1",
    [refreshToken],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const client = await getClient(row.client_id);

  if (!client) return null;

  return {
    accessToken: row.access_token,
    accessTokenExpiresAt: row.access_token_expires_at,
    refreshToken: row.refresh_token,
    refreshTokenExpiresAt: row.refresh_token_expires_at,
    scope: row.scope,
    client,
    user: { id: row.user_id, username: row.user_id },
  };
}

// Revoke token
export async function revokeToken(token: OAuth2Token): Promise<boolean> {
  const pool = getPgPool();
  const redisClient = getRedis();

  await pool.query("DELETE FROM oauth2_tokens WHERE refresh_token = $1", [
    token.refreshToken,
  ]);

  // Remove from Redis cache
  if (redisClient && token.accessToken) {
    await redisClient.del(`oauth2:token:${token.accessToken}`);
  }

  return true;
}

// Save authorization code
export async function saveAuthorizationCode(
  code: any,
  client: any,
  user: any,
): Promise<OAuth2AuthorizationCode> {
  const pool = getPgPool();

  await pool.query(
    `INSERT INTO oauth2_authorization_codes 
     (authorization_code, expires_at, redirect_uri, scope, client_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      code.authorizationCode,
      code.expiresAt,
      code.redirectUri,
      code.scope || null,
      client.clientId,
      user.id,
    ],
  );

  return {
    authorizationCode: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    scope: code.scope,
    client,
    user,
  };
}

// Get authorization code
export async function getAuthorizationCode(
  authorizationCode: string,
): Promise<OAuth2AuthorizationCode | null> {
  const pool = getPgPool();
  const result = await pool.query(
    "SELECT * FROM oauth2_authorization_codes WHERE authorization_code = $1",
    [authorizationCode],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const client = await getClient(row.client_id);

  if (!client) return null;

  return {
    authorizationCode: row.authorization_code,
    expiresAt: row.expires_at,
    redirectUri: row.redirect_uri,
    scope: row.scope,
    client,
    user: { id: row.user_id, username: row.user_id },
  };
}

// Revoke authorization code
export async function revokeAuthorizationCode(
  code: OAuth2AuthorizationCode,
): Promise<boolean> {
  const pool = getPgPool();

  await pool.query(
    "DELETE FROM oauth2_authorization_codes WHERE authorization_code = $1",
    [code.authorizationCode],
  );

  return true;
}

// Verify scope
export async function verifyScope(
  token: OAuth2Token,
  scope: string,
): Promise<boolean> {
  if (!token.scope) return false;

  const requestedScopes = scope.split(" ");
  const tokenScopes = token.scope.split(" ");

  return requestedScopes.every((s) => tokenScopes.includes(s));
}

// Get user (for password grant - optional)
export async function getUser(
  username: string,
  password: string,
): Promise<OAuth2User | null> {
  // For now, we use API keys as "users"
  // In future, this could integrate with a real user database
  if (username === "admin" && password === process.env.OAUTH2_ADMIN_PASSWORD) {
    return {
      id: "admin",
      username: "admin",
      email: "admin@mymindventures.io",
    };
  }

  return null;
}

// Get user from client (for client credentials grant)
export async function getUserFromClient(
  client: OAuth2Client,
): Promise<OAuth2User> {
  return {
    id: client.clientId,
    username: client.name,
  };
}

// Validate redirect URI
export function validateRedirectUri(
  redirectUri: string,
  client: OAuth2Client,
): boolean {
  return client.redirectUris.includes(redirectUri);
}
