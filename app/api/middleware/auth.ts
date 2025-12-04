// 🔐 ENTERPRISE-GRADE AUTHENTICATION MIDDLEWARE
// Industry Standard: API Keys + Bearer Token + Rate Limiting + Audit Logging
// RFC 6750 (Bearer Token) + RFC 6749 (OAuth 2.0 patterns)

import { Redis } from 'ioredis';

// Redis client for rate limiting & key validation
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
  }
  return redis;
}

// API Key configuration
interface ApiKeyConfig {
  key: string;
  name: string;
  scopes: string[];
  rateLimit: number; // requests per minute
  enabled: boolean;
}

// Parse API keys from environment
function getApiKeys(): ApiKeyConfig[] {
  const keys: ApiKeyConfig[] = [];
  
  // Primary key (backward compatible)
  if (process.env.MCP_BRIDGE_API_KEY) {
    keys.push({
      key: process.env.MCP_BRIDGE_API_KEY,
      name: 'primary',
      scopes: ['*'], // Full access
      rateLimit: 1000,
      enabled: true
    });
  }
  
  // Additional keys (format: KEY:NAME:SCOPES:RATE_LIMIT)
  const additionalKeys = process.env.MCP_BRIDGE_API_KEYS?.split(',') || [];
  for (const keyConfig of additionalKeys) {
    const [key, name, scopes, rateLimit] = keyConfig.split(':');
    if (key && name) {
      keys.push({
        key: key.trim(),
        name: name.trim(),
        scopes: scopes ? scopes.split('|') : ['*'],
        rateLimit: parseInt(rateLimit) || 100,
        enabled: true
      });
    }
  }
  
  return keys;
}

// Validate API key
function validateApiKey(token: string): ApiKeyConfig | null {
  const keys = getApiKeys();
  return keys.find(k => k.enabled && k.key === token) || null;
}

// Rate limiting (Redis-based)
async function checkRateLimit(keyConfig: ApiKeyConfig, ip: string): Promise<boolean> {
  const redisClient = getRedis();
  if (!redisClient) return true; // No Redis = no rate limiting
  
  const key = `ratelimit:${keyConfig.name}:${ip}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  try {
    // Add current request timestamp
    await redisClient.zadd(key, now, `${now}`);
    
    // Remove old entries outside the window
    await redisClient.zremrangebyscore(key, 0, now - windowMs);
    
    // Count requests in current window
    const count = await redisClient.zcard(key);
    
    // Set expiry
    await redisClient.expire(key, 60);
    
    return count <= keyConfig.rateLimit;
  } catch (error) {
    console.error('[Auth] Rate limit check failed:', error);
    return true; // Fail open
  }
}

// Audit logging
async function logRequest(keyConfig: ApiKeyConfig | null, request: Request, allowed: boolean) {
  const redisClient = getRedis();
  if (!redisClient) return;
  
  const log = {
    timestamp: new Date().toISOString(),
    key: keyConfig?.name || 'anonymous',
    method: request.method,
    url: new URL(request.url).pathname,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    allowed
  };
  
  try {
    await redisClient.lpush('audit:requests', JSON.stringify(log));
    await redisClient.ltrim('audit:requests', 0, 9999); // Keep last 10k requests
  } catch (error) {
    console.error('[Auth] Audit logging failed:', error);
  }
}

// Main authentication function
export async function verifyAuth(request: Request): Promise<{
  allowed: boolean;
  keyConfig?: ApiKeyConfig;
  reason?: string;
}> {
  const authHeader = request.headers.get('Authorization');
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // If no API keys configured, allow all (development mode)
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    console.log('[Auth] No API keys configured - allowing all requests (DEVELOPMENT MODE)');
    return { allowed: true };
  }
  
  // Check Authorization header
  if (!authHeader) {
    await logRequest(null, request, false);
    return { allowed: false, reason: 'Missing Authorization header' };
  }
  
  // Verify Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    await logRequest(null, request, false);
    return { allowed: false, reason: 'Invalid Authorization format (expected: Bearer <token>)' };
  }
  
  const token = authHeader.substring(7).trim();
  
  // Validate token
  const keyConfig = validateApiKey(token);
  if (!keyConfig) {
    await logRequest(null, request, false);
    return { allowed: false, reason: 'Invalid or expired API key' };
  }
  
  // Check rate limit
  const withinLimit = await checkRateLimit(keyConfig, ip);
  if (!withinLimit) {
    await logRequest(keyConfig, request, false);
    return { 
      allowed: false, 
      keyConfig,
      reason: `Rate limit exceeded (${keyConfig.rateLimit} requests/minute)` 
    };
  }
  
  // Success!
  await logRequest(keyConfig, request, true);
  return { allowed: true, keyConfig };
}

// Error responses
export function authErrorResponse(reason: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { 
        code: status === 401 ? -32001 : -32002, 
        message: reason,
        data: {
          hint: 'Add header: Authorization: Bearer <your-api-key>',
          docs: 'https://github.com/MyMindVentures/MMC_MCP_BRIDGE#authentication'
        }
      }
    }),
    { 
      status,
      headers: { 
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer realm="MCP Bridge", charset="UTF-8"'
      }
    }
  );
}

// Get API key stats (for admin dashboard)
export async function getApiKeyStats(): Promise<any[]> {
  const redisClient = getRedis();
  if (!redisClient) return [];
  
  const keys = getApiKeys();
  const stats = [];
  
  for (const key of keys) {
    try {
      const rateLimitKey = `ratelimit:${key.name}:*`;
      const currentRequests = await redisClient.keys(rateLimitKey);
      
      stats.push({
        name: key.name,
        scopes: key.scopes,
        rateLimit: key.rateLimit,
        enabled: key.enabled,
        currentRequests: currentRequests.length
      });
    } catch (error) {
      console.error(`[Auth] Failed to get stats for ${key.name}:`, error);
    }
  }
  
  return stats;
}
