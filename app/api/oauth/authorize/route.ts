// OAuth2 Authorization Endpoint
// Handles authorization code flow

import { NextResponse } from "next/server";
import * as OAuth2Model from "../model";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const responseType = url.searchParams.get("response_type");
  const scope = url.searchParams.get("scope") || "";
  const state = url.searchParams.get("state") || "";

  // Validate parameters
  if (!clientId || !redirectUri || responseType !== "code") {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing or invalid parameters",
      },
      { status: 400 },
    );
  }

  // Validate client
  const client = await OAuth2Model.getClient(clientId);
  if (!client) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Client not found",
      },
      { status: 401 },
    );
  }

  // Validate redirect URI
  if (!OAuth2Model.validateRedirectUri(redirectUri, client)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Invalid redirect_uri",
      },
      { status: 400 },
    );
  }

  // Return authorization page HTML
  return new Response(
    generateAuthorizationPage(clientId, redirectUri, scope, state, client.name),
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      client_id,
      redirect_uri,
      scope,
      state,
      approved,
      username,
      password,
    } = body;

    if (!approved) {
      // User denied authorization
      return NextResponse.json(
        {
          error: "access_denied",
          error_description: "User denied authorization",
        },
        { status: 403 },
      );
    }

    // Validate client
    const client = await OAuth2Model.getClient(client_id);
    if (!client) {
      return NextResponse.json(
        {
          error: "invalid_client",
          error_description: "Client not found",
        },
        { status: 401 },
      );
    }

    // Authenticate user (simple for now)
    const user = await OAuth2Model.getUser(username, password);
    if (!user) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Invalid username or password",
        },
        { status: 401 },
      );
    }

    // Generate authorization code
    const authorizationCode = generateRandomString(32);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OAuth2Model.saveAuthorizationCode(
      {
        authorizationCode,
        expiresAt,
        redirectUri: redirect_uri,
        scope,
      },
      client,
      user,
    );

    // Redirect back to client with code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", authorizationCode);
    if (state) redirectUrl.searchParams.set("state", state);

    return NextResponse.json({
      redirect_uri: redirectUrl.toString(),
    });
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

function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateAuthorizationPage(
  clientId: string,
  redirectUri: string,
  scope: string,
  state: string,
  clientName: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize ${clientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 450px;
      width: 100%;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #667eea;
      font-size: 28px;
      font-weight: 700;
    }
    .client-info {
      background: #f7f9fc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .client-info h2 {
      font-size: 18px;
      color: #2d3748;
      margin-bottom: 10px;
    }
    .client-info p {
      color: #718096;
      font-size: 14px;
      line-height: 1.6;
    }
    .scopes {
      margin: 20px 0;
    }
    .scopes h3 {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .scope-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      color: #2d3748;
      font-size: 14px;
    }
    .scope-item::before {
      content: '✓';
      color: #48bb78;
      font-weight: bold;
      margin-right: 10px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }
    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .buttons {
      display: flex;
      gap: 12px;
      margin-top: 30px;
    }
    button {
      flex: 1;
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-approve {
      background: #667eea;
      color: white;
    }
    .btn-approve:hover {
      background: #5568d3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .btn-deny {
      background: #e2e8f0;
      color: #4a5568;
    }
    .btn-deny:hover {
      background: #cbd5e0;
    }
    .security-note {
      margin-top: 20px;
      padding: 12px;
      background: #fef5e7;
      border-left: 3px solid #f39c12;
      border-radius: 4px;
      font-size: 12px;
      color: #7d6608;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <h1>🔐 MMC MCP Bridge</h1>
    </div>
    
    <div class="client-info">
      <h2>${clientName}</h2>
      <p>This application wants to access your MCP Bridge account and perform actions on your behalf.</p>
    </div>
    
    <div class="scopes">
      <h3>Requested Permissions:</h3>
      ${scope
        .split(" ")
        .map((s) => `<div class="scope-item">${s || "Full access"}</div>`)
        .join("")}
    </div>
    
    <form id="authForm">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required autocomplete="username">
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>
      
      <div class="buttons">
        <button type="button" class="btn-deny" onclick="deny()">Deny</button>
        <button type="submit" class="btn-approve">Authorize</button>
      </div>
    </form>
    
    <div class="security-note">
      🔒 Your credentials are encrypted and never shared with ${clientName}.
    </div>
  </div>
  
  <script>
    const form = document.getElementById('authForm');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/api/oauth/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: '${clientId}',
            redirect_uri: '${redirectUri}',
            scope: '${scope}',
            state: '${state}',
            approved: true,
            username,
            password
          })
        });
        
        const data = await response.json();
        
        if (data.redirect_uri) {
          window.location.href = data.redirect_uri;
        } else {
          alert('Authorization failed: ' + (data.error_description || 'Unknown error'));
        }
      } catch (error) {
        alert('Authorization failed: ' + error.message);
      }
    });
    
    function deny() {
      const redirectUrl = new URL('${redirectUri}');
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'User denied authorization');
      if ('${state}') redirectUrl.searchParams.set('state', '${state}');
      window.location.href = redirectUrl.toString();
    }
  </script>
</body>
</html>
  `;
}
