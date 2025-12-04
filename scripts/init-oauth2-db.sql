-- OAuth2 Database Schema Initialization
-- Run this on your Railway PostgreSQL database

-- Create oauth2_clients table
CREATE TABLE IF NOT EXISTS oauth2_clients (
  client_id VARCHAR(255) PRIMARY KEY,
  client_secret VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  grants TEXT[] NOT NULL,
  scopes TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create oauth2_tokens table
CREATE TABLE IF NOT EXISTS oauth2_tokens (
  access_token VARCHAR(255) PRIMARY KEY,
  access_token_expires_at TIMESTAMP NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  refresh_token_expires_at TIMESTAMP,
  client_id VARCHAR(255) NOT NULL REFERENCES oauth2_clients(client_id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  scopes TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create oauth2_authorization_codes table
CREATE TABLE IF NOT EXISTS oauth2_authorization_codes (
  code VARCHAR(255) PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  redirect_uri TEXT NOT NULL,
  client_id VARCHAR(255) NOT NULL REFERENCES oauth2_clients(client_id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  scopes TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth2_tokens_client_id ON oauth2_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth2_tokens_refresh_token ON oauth2_tokens(refresh_token);
CREATE INDEX IF NOT EXISTS idx_oauth2_tokens_expires_at ON oauth2_tokens(access_token_expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth2_codes_client_id ON oauth2_authorization_codes(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth2_codes_expires_at ON oauth2_authorization_codes(expires_at);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for oauth2_clients
DROP TRIGGER IF EXISTS update_oauth2_clients_updated_at ON oauth2_clients;
CREATE TRIGGER update_oauth2_clients_updated_at
  BEFORE UPDATE ON oauth2_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create cleanup function for expired tokens and codes
CREATE OR REPLACE FUNCTION cleanup_expired_oauth2_data()
RETURNS void AS $$
BEGIN
  -- Delete expired access tokens
  DELETE FROM oauth2_tokens WHERE access_token_expires_at < CURRENT_TIMESTAMP;
  
  -- Delete expired authorization codes
  DELETE FROM oauth2_authorization_codes WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust if needed)
-- GRANT ALL PRIVILEGES ON TABLE oauth2_clients TO your_user;
-- GRANT ALL PRIVILEGES ON TABLE oauth2_tokens TO your_user;
-- GRANT ALL PRIVILEGES ON TABLE oauth2_authorization_codes TO your_user;

-- Insert a default admin client (optional - for testing)
-- INSERT INTO oauth2_clients (
--   client_id,
--   client_secret,
--   name,
--   redirect_uris,
--   grants,
--   scopes
-- ) VALUES (
--   'mmc_oauth2_client_admin',
--   'mmc_oauth2_secret_admin_change_me',
--   'Admin Client',
--   ARRAY['http://localhost:5678/oauth/callback'],
--   ARRAY['authorization_code', 'refresh_token', 'client_credentials'],
--   ARRAY['*']
-- ) ON CONFLICT (client_id) DO NOTHING;

-- Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'oauth2_%'
ORDER BY table_name;

