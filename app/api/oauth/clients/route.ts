// OAuth2 Client Management Endpoint
// Create, list, update, delete OAuth2 clients

import { NextResponse } from 'next/server';
import { verifyAuth, authErrorResponse } from '../../middleware/auth';
import * as OAuth2Model from '../model';
import * as crypto from 'crypto';

// List all OAuth2 clients
export async function GET(request: Request) {
  // Require admin authentication
  const authResult = await verifyAuth(request);
  if (!authResult.allowed || authResult.keyConfig?.name !== 'primary') {
    return authErrorResponse('Admin access required', 403);
  }
  
  const pool = OAuth2Model.getPgPool();
  const result = await pool.query('SELECT * FROM oauth2_clients ORDER BY created_at DESC');
  
  return NextResponse.json({
    clients: result.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      name: row.name,
      redirectUris: row.redirect_uris,
      grants: row.grants,
      scopes: row.scopes,
      enabled: row.enabled,
      createdAt: row.created_at
    }))
  });
}

// Create new OAuth2 client
export async function POST(request: Request) {
  // Require admin authentication
  const authResult = await verifyAuth(request);
  if (!authResult.allowed || authResult.keyConfig?.name !== 'primary') {
    return authErrorResponse('Admin access required', 403);
  }
  
  try {
    const body = await request.json();
    const { name, redirectUris, grants, scopes } = body;
    
    if (!name || !redirectUris || !grants) {
      return NextResponse.json({
        error: 'invalid_request',
        error_description: 'Missing required fields: name, redirectUris, grants'
      }, { status: 400 });
    }
    
    // Generate client credentials
    const clientId = 'mmc_oauth2_client_' + crypto.randomBytes(16).toString('hex');
    const clientSecret = 'mmc_oauth2_secret_' + crypto.randomBytes(32).toString('hex');
    
    const pool = OAuth2Model.getPgPool();
    const result = await pool.query(
      `INSERT INTO oauth2_clients 
       (client_id, client_secret, redirect_uris, grants, scopes, name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        clientId,
        clientSecret,
        redirectUris,
        grants || ['authorization_code', 'refresh_token'],
        scopes || ['*'],
        name
      ]
    );
    
    const client = result.rows[0];
    
    return NextResponse.json({
      client: {
        id: client.id,
        clientId: client.client_id,
        clientSecret: client.client_secret, // Only returned on creation!
        name: client.name,
        redirectUris: client.redirect_uris,
        grants: client.grants,
        scopes: client.scopes,
        enabled: client.enabled,
        createdAt: client.created_at
      },
      warning: 'Save the client_secret securely - it will not be shown again!'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      error: 'server_error',
      error_description: error.message
    }, { status: 500 });
  }
}

// Delete OAuth2 client
export async function DELETE(request: Request) {
  // Require admin authentication
  const authResult = await verifyAuth(request);
  if (!authResult.allowed || authResult.keyConfig?.name !== 'primary') {
    return authErrorResponse('Admin access required', 403);
  }
  
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    
    if (!clientId) {
      return NextResponse.json({
        error: 'invalid_request',
        error_description: 'Missing client_id parameter'
      }, { status: 400 });
    }
    
    const pool = OAuth2Model.getPgPool();
    await pool.query('DELETE FROM oauth2_clients WHERE client_id = $1', [clientId]);
    
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'server_error',
      error_description: error.message
    }, { status: 500 });
  }
}

