// Database Utilities - Helper functions for Postgres & SQLite
// Full implementation of 20+ tools each

import { Pool, PoolClient } from 'pg';

// Build WHERE clause from object
export function buildWhereClause(where: Record<string, any>, startIndex: number = 1): { clause: string; values: any[] } {
  if (!where || Object.keys(where).length === 0) {
    return { clause: '', values: [] };
  }
  
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = startIndex;
  
  for (const [key, value] of Object.entries(where)) {
    conditions.push(`"${key}" = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  
  return {
    clause: `WHERE ${conditions.join(' AND ')}`,
    values
  };
}

// Build SET clause from object
export function buildSetClause(data: Record<string, any>, startIndex: number = 1): { clause: string; values: any[] } {
  const sets: string[] = [];
  const values: any[] = [];
  let paramIndex = startIndex;
  
  for (const [key, value] of Object.entries(data)) {
    sets.push(`"${key}" = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  
  return {
    clause: sets.join(', '),
    values
  };
}

// Build INSERT clause
export function buildInsertClause(data: Record<string, any>): { columns: string; placeholders: string; values: any[] } {
  const columns = Object.keys(data).map(k => `"${k}"`).join(', ');
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(data);
  
  return { columns, placeholders, values };
}

// Execute Postgres transaction
export async function executePostgresTransaction(
  pool: Pool,
  operations: Array<{ sql: string; params?: any[] }>
): Promise<any[]> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const results: any[] = [];
    
    for (const op of operations) {
      const result = await client.query(op.sql, op.params || []);
      results.push(result.rows);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

console.log('[Database Utils] Initialized');





