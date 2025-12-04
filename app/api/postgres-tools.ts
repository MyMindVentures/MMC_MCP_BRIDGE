// PostgreSQL Tool Implementations - FULL SDK
// All 25+ tools with complete pg Pool support

import { Pool, PoolClient } from "pg";

// Singleton connection pool
let pgPool: Pool | null = null;

function getPool(): Pool {
  if (!process.env.POSTGRES_CONNECTION_STRING) {
    throw new Error("POSTGRES_CONNECTION_STRING not configured");
  }
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_CONNECTION_STRING,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pgPool;
}

// Helper: Build WHERE clause
function buildWhereClause(where: Record<string, any>): { clause: string; values: any[] } {
  if (!where || Object.keys(where).length === 0) {
    return { clause: "", values: [] };
  }
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(where)) {
    conditions.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  return {
    clause: `WHERE ${conditions.join(" AND ")}`,
    values,
  };
}

// SCHEMA DISCOVERY
export async function listDatabases(): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    "SELECT datname FROM pg_database WHERE datistemplate = false"
  );
  return result.rows;
}

export async function listSchemas(database?: string): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema')"
  );
  return result.rows;
}

export async function listTables(schema: string = "public"): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = $1",
    [schema]
  );
  return result.rows;
}

export async function describeTable(table: string, schema: string = "public"): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [schema, table]
  );
  return result.rows;
}

export async function listIndexes(table: string, schema: string = "public"): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2`,
    [schema, table]
  );
  return result.rows;
}

export async function listConstraints(table: string, schema: string = "public"): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT conname, contype, pg_get_constraintdef(oid) as definition
     FROM pg_constraint
     WHERE conrelid = ($1 || '.' || $2)::regclass`,
    [schema, table]
  );
  return result.rows;
}

// DDL OPERATIONS
export async function createTable(table: string, columns: any[], schema: string = "public"): Promise<any> {
  const pool = getPool();
  const columnDefs = columns.map((col: any) => {
    let def = `${col.name} ${col.type}`;
    if (col.primaryKey) def += " PRIMARY KEY";
    if (col.notNull) def += " NOT NULL";
    if (col.unique) def += " UNIQUE";
    if (col.default !== undefined) def += ` DEFAULT ${col.default}`;
    return def;
  }).join(", ");

  const sql = `CREATE TABLE ${schema}.${table} (${columnDefs})`;
  const result = await pool.query(sql);
  return { success: true, sql };
}

export async function alterTable(table: string, action: string, schema: string = "public"): Promise<any> {
  const pool = getPool();
  const sql = `ALTER TABLE ${schema}.${table} ${action}`;
  const result = await pool.query(sql);
  return { success: true, sql };
}

export async function dropTable(table: string, schema: string = "public", cascade: boolean = false): Promise<any> {
  const pool = getPool();
  const sql = `DROP TABLE ${schema}.${table}${cascade ? " CASCADE" : ""}`;
  const result = await pool.query(sql);
  return { success: true, sql };
}

export async function createIndex(
  table: string,
  columns: string[],
  indexName?: string,
  unique: boolean = false,
  schema: string = "public"
): Promise<any> {
  const pool = getPool();
  const name = indexName || `idx_${table}_${columns.join("_")}`;
  const sql = `CREATE ${unique ? "UNIQUE " : ""}INDEX ${name} ON ${schema}.${table} (${columns.join(", ")})`;
  const result = await pool.query(sql);
  return { success: true, sql, indexName: name };
}

export async function dropIndex(indexName: string, schema: string = "public"): Promise<any> {
  const pool = getPool();
  const sql = `DROP INDEX ${schema}.${indexName}`;
  const result = await pool.query(sql);
  return { success: true, sql };
}

// DML OPERATIONS
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function select(
  table: string,
  columns?: string[],
  where?: Record<string, any>,
  orderBy?: string,
  limit?: number,
  offset?: number,
  schema: string = "public"
): Promise<any[]> {
  const pool = getPool();
  const cols = columns && columns.length > 0 ? columns.join(", ") : "*";
  const { clause, values } = buildWhereClause(where || {});
  
  let sql = `SELECT ${cols} FROM ${schema}.${table} ${clause}`;
  if (orderBy) sql += ` ORDER BY ${orderBy}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;

  const result = await pool.query(sql, values);
  return result.rows;
}

export async function insert(
  table: string,
  data: Record<string, any>,
  returning?: string[],
  schema: string = "public"
): Promise<any> {
  const pool = getPool();
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

  let sql = `INSERT INTO ${schema}.${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  if (returning && returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }

  const result = await pool.query(sql, values);
  return returning ? result.rows[0] : { success: true, rowCount: result.rowCount };
}

export async function update(
  table: string,
  data: Record<string, any>,
  where: Record<string, any>,
  returning?: string[],
  schema: string = "public"
): Promise<any> {
  const pool = getPool();
  const setKeys = Object.keys(data);
  const setValues = Object.values(data);
  const setClause = setKeys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const { clause, values: whereValues } = buildWhereClause(where);
  const allValues = [...setValues, ...whereValues];

  let sql = `UPDATE ${schema}.${table} SET ${setClause} ${clause}`;
  if (returning && returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }

  const result = await pool.query(sql, allValues);
  return returning ? result.rows : { success: true, rowCount: result.rowCount };
}

export async function deleteRows(
  table: string,
  where: Record<string, any>,
  returning?: string[],
  schema: string = "public"
): Promise<any> {
  const pool = getPool();
  const { clause, values } = buildWhereClause(where);

  let sql = `DELETE FROM ${schema}.${table} ${clause}`;
  if (returning && returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }

  const result = await pool.query(sql, values);
  return returning ? result.rows : { success: true, rowCount: result.rowCount };
}

export async function upsert(
  table: string,
  data: Record<string, any>,
  conflictColumns: string[],
  returning?: string[],
  schema: string = "public"
): Promise<any> {
  const pool = getPool();
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

  const updateKeys = keys.filter((k) => !conflictColumns.includes(k));
  const updateClause = updateKeys.map((key) => `${key} = EXCLUDED.${key}`).join(", ");

  let sql = `INSERT INTO ${schema}.${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  sql += ` ON CONFLICT (${conflictColumns.join(", ")}) DO UPDATE SET ${updateClause}`;
  
  if (returning && returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }

  const result = await pool.query(sql, values);
  return returning ? result.rows[0] : { success: true, rowCount: result.rowCount };
}

export async function bulkInsert(
  table: string,
  data: Record<string, any>[],
  returning?: string[],
  schema: string = "public"
): Promise<any> {
  if (data.length === 0) return { success: true, rowCount: 0 };

  const pool = getPool();
  const keys = Object.keys(data[0]);
  const values: any[] = [];
  const valuePlaceholders: string[] = [];

  let paramIndex = 1;
  for (const row of data) {
    const rowPlaceholders = keys.map(() => `$${paramIndex++}`);
    valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
    values.push(...Object.values(row));
  }

  let sql = `INSERT INTO ${schema}.${table} (${keys.join(", ")}) VALUES ${valuePlaceholders.join(", ")}`;
  if (returning && returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }

  const result = await pool.query(sql, values);
  return returning ? result.rows : { success: true, rowCount: result.rowCount };
}

// TRANSACTIONS
let transactionClient: PoolClient | null = null;

export async function beginTransaction(isolationLevel?: string): Promise<any> {
  const pool = getPool();
  transactionClient = await pool.connect();
  
  let sql = "BEGIN";
  if (isolationLevel) {
    sql += ` ISOLATION LEVEL ${isolationLevel}`;
  }
  
  await transactionClient.query(sql);
  return { success: true, message: "Transaction started" };
}

export async function commit(): Promise<any> {
  if (!transactionClient) {
    throw new Error("No active transaction");
  }
  
  await transactionClient.query("COMMIT");
  transactionClient.release();
  transactionClient = null;
  
  return { success: true, message: "Transaction committed" };
}

export async function rollback(): Promise<any> {
  if (!transactionClient) {
    throw new Error("No active transaction");
  }
  
  await transactionClient.query("ROLLBACK");
  transactionClient.release();
  transactionClient = null;
  
  return { success: true, message: "Transaction rolled back" };
}

// MAINTENANCE
export async function vacuum(table?: string, full: boolean = false, analyze: boolean = true): Promise<any> {
  const pool = getPool();
  let sql = "VACUUM";
  if (full) sql += " FULL";
  if (analyze) sql += " ANALYZE";
  if (table) sql += ` ${table}`;

  await pool.query(sql);
  return { success: true, sql };
}

export async function analyzeTable(table?: string): Promise<any> {
  const pool = getPool();
  const sql = table ? `ANALYZE ${table}` : "ANALYZE";
  await pool.query(sql);
  return { success: true, sql };
}

export async function explain(sql: string, analyze: boolean = false): Promise<any[]> {
  const pool = getPool();
  const explainSql = `EXPLAIN ${analyze ? "ANALYZE " : ""}${sql}`;
  const result = await pool.query(explainSql);
  return result.rows;
}

export async function tableSize(table: string, schema: string = "public"): Promise<any> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT 
      pg_size_pretty(pg_total_relation_size($1 || '.' || $2)) as total_size,
      pg_size_pretty(pg_relation_size($1 || '.' || $2)) as table_size,
      pg_size_pretty(pg_indexes_size($1 || '.' || $2)) as indexes_size`,
    [schema, table]
  );
  return result.rows[0];
}

// MAIN EXECUTOR
export async function executePostgresTool(tool: string, params: any): Promise<any> {
  try {
    switch (tool) {
      // Schema Discovery
      case "listDatabases":
        return await listDatabases();
      case "listSchemas":
        return await listSchemas(params.database);
      case "listTables":
        return await listTables(params.schema);
      case "describeTable":
        return await describeTable(params.table, params.schema);
      case "listIndexes":
        return await listIndexes(params.table, params.schema);
      case "listConstraints":
        return await listConstraints(params.table, params.schema);

      // DDL Operations
      case "createTable":
        return await createTable(params.table, params.columns, params.schema);
      case "alterTable":
        return await alterTable(params.table, params.action, params.schema);
      case "dropTable":
        return await dropTable(params.table, params.schema, params.cascade);
      case "createIndex":
        return await createIndex(
          params.table,
          params.columns,
          params.indexName,
          params.unique,
          params.schema
        );
      case "dropIndex":
        return await dropIndex(params.indexName, params.schema);

      // DML Operations
      case "query":
        return await query(params.sql, params.params);
      case "select":
        return await select(
          params.table,
          params.columns,
          params.where,
          params.orderBy,
          params.limit,
          params.offset,
          params.schema
        );
      case "insert":
        return await insert(params.table, params.data, params.returning, params.schema);
      case "update":
        return await update(
          params.table,
          params.data,
          params.where,
          params.returning,
          params.schema
        );
      case "delete":
        return await deleteRows(params.table, params.where, params.returning, params.schema);
      case "upsert":
        return await upsert(
          params.table,
          params.data,
          params.conflictColumns,
          params.returning,
          params.schema
        );
      case "bulkInsert":
        return await bulkInsert(params.table, params.data, params.returning, params.schema);

      // Transactions
      case "beginTransaction":
        return await beginTransaction(params.isolationLevel);
      case "commit":
        return await commit();
      case "rollback":
        return await rollback();

      // Maintenance
      case "vacuum":
        return await vacuum(params.table, params.full, params.analyze);
      case "analyze":
        return await analyzeTable(params.table);
      case "explain":
        return await explain(params.sql, params.analyze);
      case "tableSize":
        return await tableSize(params.table, params.schema);

      default:
        throw new Error(`Unknown postgres tool: ${tool}`);
    }
  } catch (error: any) {
    throw new Error(`Postgres tool '${tool}' failed: ${error.message}`);
  }
}
