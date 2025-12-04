// Postgres Tools - Complete implementation of 25+ tools
// From basic query to advanced schema management

import { Pool } from 'pg';
import { buildWhereClause, buildSetClause, buildInsertClause } from './database-utils';

export async function executePostgresTool(
  pool: Pool,
  toolName: string,
  params: any
): Promise<any> {
  
  switch (toolName) {
    // === SCHEMA DISCOVERY ===
    
    case 'listDatabases': {
      const result = await pool.query('SELECT datname as name FROM pg_database WHERE datistemplate = false');
      return result.rows;
    }
    
    case 'listSchemas': {
      const result = await pool.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE \'pg_%\' AND schema_name != \'information_schema\'');
      return result.rows;
    }
    
    case 'listTables': {
      const schema = params.schema || 'public';
      const result = await pool.query(
        'SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name',
        [schema]
      );
      return result.rows;
    }
    
    case 'describeTable': {
      const { table, schema = 'public' } = params;
      const result = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `, [schema, table]);
      return result.rows;
    }
    
    case 'listIndexes': {
      const { table, schema = 'public' } = params;
      const result = await pool.query(`
        SELECT
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique,
          ix.indisprimary as is_primary
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = $1 AND t.relname = $2
        ORDER BY i.relname, a.attnum
      `, [schema, table]);
      return result.rows;
    }
    
    case 'listConstraints': {
      const { table, schema = 'public' } = params;
      const result = await pool.query(`
        SELECT
          conname as constraint_name,
          contype as constraint_type,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = (
          SELECT oid FROM pg_class 
          WHERE relname = $2 
          AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = $1)
        )
      `, [schema, table]);
      return result.rows;
    }
    
    // === DDL OPERATIONS ===
    
    case 'createTable': {
      const { table, columns, schema = 'public' } = params;
      const columnDefs = columns.map((col: any) => {
        let def = `"${col.name}" ${col.type}`;
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (col.notNull) def += ' NOT NULL';
        if (col.unique) def += ' UNIQUE';
        if (col.default) def += ` DEFAULT ${col.default}`;
        return def;
      }).join(', ');
      
      const sql = `CREATE TABLE "${schema}"."${table}" (${columnDefs})`;
      await pool.query(sql);
      return { success: true, table: `${schema}.${table}` };
    }
    
    case 'alterTable': {
      const { table, action, schema = 'public' } = params;
      const sql = `ALTER TABLE "${schema}"."${table}" ${action}`;
      await pool.query(sql);
      return { success: true };
    }
    
    case 'dropTable': {
      const { table, schema = 'public', cascade = false } = params;
      const sql = `DROP TABLE "${schema}"."${table}"${cascade ? ' CASCADE' : ''}`;
      await pool.query(sql);
      return { success: true, dropped: `${schema}.${table}` };
    }
    
    case 'createIndex': {
      const { table, columns, indexName, unique = false } = params;
      const name = indexName || `idx_${table}_${columns.join('_')}`;
      const cols = columns.map((c: string) => `"${c}"`).join(', ');
      const sql = `CREATE ${unique ? 'UNIQUE ' : ''}INDEX "${name}" ON "${table}" (${cols})`;
      await pool.query(sql);
      return { success: true, index: name };
    }
    
    case 'dropIndex': {
      const { indexName, schema = 'public' } = params;
      const sql = `DROP INDEX "${schema}"."${indexName}"`;
      await pool.query(sql);
      return { success: true, dropped: indexName };
    }
    
    // === DML OPERATIONS ===
    
    case 'query': {
      const result = await pool.query(params.sql, params.params || []);
      return result.rows;
    }
    
    case 'select': {
      const { table, columns = ['*'], where, orderBy, limit, offset } = params;
      const cols = columns.join(', ');
      let sql = `SELECT ${cols} FROM "${table}"`;
      
      const { clause, values } = buildWhereClause(where);
      if (clause) sql += ` ${clause}`;
      if (orderBy) sql += ` ORDER BY ${orderBy}`;
      if (limit) sql += ` LIMIT ${limit}`;
      if (offset) sql += ` OFFSET ${offset}`;
      
      const result = await pool.query(sql, values);
      return result.rows;
    }
    
    case 'insert': {
      const { table, data, returning = [] } = params;
      const { columns, placeholders, values } = buildInsertClause(data);
      let sql = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`;
      if (returning.length > 0) {
        sql += ` RETURNING ${returning.join(', ')}`;
      }
      const result = await pool.query(sql, values);
      return returning.length > 0 ? result.rows[0] : { success: true, rowCount: result.rowCount };
    }
    
    case 'update': {
      const { table, data, where, returning = [] } = params;
      const { clause: setClause, values: setValues } = buildSetClause(data);
      const { clause: whereClause, values: whereValues } = buildWhereClause(where, setValues.length + 1);
      
      let sql = `UPDATE "${table}" SET ${setClause}`;
      if (whereClause) sql += ` ${whereClause}`;
      if (returning.length > 0) {
        sql += ` RETURNING ${returning.join(', ')}`;
      }
      
      const result = await pool.query(sql, [...setValues, ...whereValues]);
      return returning.length > 0 ? result.rows : { success: true, rowCount: result.rowCount };
    }
    
    case 'delete': {
      const { table, where, returning = [] } = params;
      const { clause, values } = buildWhereClause(where);
      let sql = `DELETE FROM "${table}"`;
      if (clause) sql += ` ${clause}`;
      if (returning.length > 0) {
        sql += ` RETURNING ${returning.join(', ')}`;
      }
      const result = await pool.query(sql, values);
      return returning.length > 0 ? result.rows : { success: true, rowCount: result.rowCount };
    }
    
    case 'upsert': {
      const { table, data, conflictColumns, returning = [] } = params;
      const { columns, placeholders, values } = buildInsertClause(data);
      const { clause: updateClause } = buildSetClause(data);
      
      let sql = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`;
      sql += ` ON CONFLICT (${conflictColumns.join(', ')}) DO UPDATE SET ${updateClause}`;
      if (returning.length > 0) {
        sql += ` RETURNING ${returning.join(', ')}`;
      }
      
      const result = await pool.query(sql, values);
      return returning.length > 0 ? result.rows[0] : { success: true };
    }
    
    case 'bulkInsert': {
      const { table, data, returning = [] } = params;
      if (!Array.isArray(data) || data.length === 0) {
        return { success: true, rowCount: 0 };
      }
      
      const columns = Object.keys(data[0]).map(k => `"${k}"`).join(', ');
      const valueSets: string[] = [];
      const allValues: any[] = [];
      let paramIndex = 1;
      
      for (const row of data) {
        const rowPlaceholders: string[] = [];
        for (const value of Object.values(row)) {
          rowPlaceholders.push(`$${paramIndex++}`);
          allValues.push(value);
        }
        valueSets.push(`(${rowPlaceholders.join(', ')})`);
      }
      
      let sql = `INSERT INTO "${table}" (${columns}) VALUES ${valueSets.join(', ')}`;
      if (returning.length > 0) {
        sql += ` RETURNING ${returning.join(', ')}`;
      }
      
      const result = await pool.query(sql, allValues);
      return returning.length > 0 ? result.rows : { success: true, rowCount: result.rowCount };
    }
    
    // === TRANSACTIONS ===
    
    case 'beginTransaction': {
      const { isolationLevel } = params;
      let sql = 'BEGIN';
      if (isolationLevel) sql += ` ISOLATION LEVEL ${isolationLevel}`;
      await pool.query(sql);
      return { success: true, message: 'Transaction started' };
    }
    
    case 'commit': {
      await pool.query('COMMIT');
      return { success: true, message: 'Transaction committed' };
    }
    
    case 'rollback': {
      await pool.query('ROLLBACK');
      return { success: true, message: 'Transaction rolled back' };
    }
    
    // === MAINTENANCE ===
    
    case 'vacuum': {
      const { table, full = false, analyze = true } = params;
      let sql = 'VACUUM';
      if (full) sql += ' FULL';
      if (analyze) sql += ' ANALYZE';
      if (table) sql += ` "${table}"`;
      await pool.query(sql);
      return { success: true, message: `Vacuum completed${table ? ` for ${table}` : ''}` };
    }
    
    case 'analyze': {
      const { table } = params;
      const sql = table ? `ANALYZE "${table}"` : 'ANALYZE';
      await pool.query(sql);
      return { success: true, message: `Analyze completed${table ? ` for ${table}` : ''}` };
    }
    
    case 'explain': {
      const { sql, analyze = false } = params;
      const explainSql = `EXPLAIN${analyze ? ' ANALYZE' : ''} ${sql}`;
      const result = await pool.query(explainSql);
      return result.rows;
    }
    
    case 'tableSize': {
      const { table, schema = 'public' } = params;
      const result = await pool.query(`
        SELECT
          pg_size_pretty(pg_total_relation_size(quote_ident($1) || '.' || quote_ident($2))) as total_size,
          pg_size_pretty(pg_relation_size(quote_ident($1) || '.' || quote_ident($2))) as table_size,
          pg_size_pretty(pg_indexes_size(quote_ident($1) || '.' || quote_ident($2))) as indexes_size
      `, [schema, table]);
      return result.rows[0];
    }
    
    default:
      throw new Error(`Unknown postgres tool: ${toolName}`);
  }
}

console.log('[Postgres Tools] 25+ tools loaded');

