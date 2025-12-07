// OAuth2 Token Endpoint
// Handles token exchange and refresh

import { NextResponse } from "next/server";
import * as OAuth2Model from "../model";
import * as crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const grantType = body.get("grant_type") as string;

    switch (grantType) {
      case "authorization_code":
        return await handleAuthorizationCodeGrant(body);
      case "refresh_token":
        return await handleRefreshTokenGrant(body);
      case "client_credentials":
        return await handleClientCredentialsGrant(body);
      default:
        return NextResponse.json(
          {
            error: "unsupported_grant_type",
            error_description: `Grant type '${grantType}' is not supported`,
          },
          { status: 400 },
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "server_error",
        error_description: error.message,
      },
      { status: 500 },
    );
  }
}

async function handleAuthorizationCodeGrant(body: FormData) {
  const code = body.get("code") as string;
  const redirectUri = body.get("redirect_uri") as string;
  const clientId = body.get("client_id") as string;
  const clientSecret = body.get("client_secret") as string;

  if (!code || !redirectUri || !clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters",
      },
      { status: 400 },
    );
  }

  // Validate client
  const client = await OAuth2Model.getClient(clientId, clientSecret);
  if (!client) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Client authentication failed",
      },
      { status: 401 },
    );
  }

  // Get authorization code
  const authCode = await OAuth2Model.getAuthorizationCode(code);
  if (!authCode) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Authorization code is invalid or expired",
      },
      { status: 400 },
    );
  }

  // Validate redirect URI
  if (authCode.redirectUri !== redirectUri) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Redirect URI mismatch",
      },
      { status: 400 },
    );
  }

  // Check expiration
  if (authCode.expiresAt < new Date()) {
    await OAuth2Model.revokeAuthorizationCode(authCode);
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Authorization code has expired",
      },
      { status: 400 },
    );
  }

  // Generate tokens
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const expiresIn = 3600; // 1 hour

  const token = await OAuth2Model.saveToken(
    {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      scope: authCode.scope,
    },
    client,
    authCode.user,
  );

  // Revoke authorization code (one-time use)
  await OAuth2Model.revokeAuthorizationCode(authCode);

  return NextResponse.json({
    access_token: token.accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
    refresh_token: token.refreshToken,
    scope: token.scope,
  });
}

async function handleRefreshTokenGrant(body: FormData) {
  const refreshToken = body.get("refresh_token") as string;
  const clientId = body.get("client_id") as string;
  const clientSecret = body.get("client_secret") as string;

  if (!refreshToken || !clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters",
      },
      { status: 400 },
    );
  }

  // Validate client
  const client = await OAuth2Model.getClient(clientId, clientSecret);
  if (!client) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Client authentication failed",
      },
      { status: 401 },
    );
  }

  // Get refresh token
  const token = await OAuth2Model.getRefreshToken(refreshToken);
  if (!token) {
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Refresh token is invalid or expired",
      },
      { status: 400 },
    );
  }

  // Check expiration
  if (token.refreshTokenExpiresAt && token.refreshTokenExpiresAt < new Date()) {
    await OAuth2Model.revokeToken(token);
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Refresh token has expired",
      },
      { status: 400 },
    );
  }

  // Generate new tokens
  const newAccessToken = generateToken();
  const newRefreshToken = generateToken();
  const expiresIn = 3600; // 1 hour

  // Revoke old tokens
  await OAuth2Model.revokeToken(token);

  // Save new tokens
  const newToken = await OAuth2Model.saveToken(
    {
      accessToken: newAccessToken,
      accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      scope: token.scope,
    },
    client,
    token.user,
  );

  return NextResponse.json({
    access_token: newToken.accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
    refresh_token: newToken.refreshToken,
    scope: newToken.scope,
  });
}

async function handleClientCredentialsGrant(body: FormData) {
  const clientId = body.get("client_id") as string;
  const clientSecret = body.get("client_secret") as string;
  const scope = (body.get("scope") as string) || "";

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters",
      },
      { status: 400 },
    );
  }

  // Validate client
  const client = await OAuth2Model.getClient(clientId, clientSecret);
  if (!client) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Client authentication failed",
      },
      { status: 401 },
    );
  }

  // Get user from client
  const user = await OAuth2Model.getUserFromClient(client);

  // Generate token
  const accessToken = generateToken();
  const expiresIn = 3600; // 1 hour

  const token = await OAuth2Model.saveToken(
    {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      scope,
    },
    client,
    user,
  );

  return NextResponse.json({
    access_token: token.accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: token.scope,
  });
}

function generateToken(): string {
  return "mmc_oauth2_" + crypto.randomBytes(32).toString("hex");
}
