// SQLite Tools - Complete implementation of 22+ tools
// From basic query to advanced schema management

import Database from "better-sqlite3";

export async function executeSQLiteTool(
  db: Database.Database,
  toolName: string,
  params: any,
): Promise<any> {
  switch (toolName) {
    // === SCHEMA DISCOVERY ===

    case "listTables": {
      const tables = db
        .prepare(
          "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name",
        )
        .all();
      return tables;
    }

    case "tableInfo": {
      const { table } = params;
      const info = db.prepare(`PRAGMA table_info(${table})`).all();
      return info;
    }

    case "listIndexes": {
      const { table } = params;
      const indexes = db.prepare(`PRAGMA index_list(${table})`).all();
      const detailed = indexes.map((idx: any) => {
        const columns = db.prepare(`PRAGMA index_info(${idx.name})`).all();
        return { ...idx, columns };
      });
      return detailed;
    }

    case "getForeignKeys": {
      const { table } = params;
      const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${table})`).all();
      return foreignKeys;
    }

    // === DDL OPERATIONS ===

    case "createTable": {
      const { table, columns } = params;
      const columnDefs = columns
        .map((col: any) => {
          let def = `"${col.name}" ${col.type}`;
          if (col.primaryKey) def += " PRIMARY KEY";
          if (col.autoIncrement) def += " AUTOINCREMENT";
          if (col.notNull) def += " NOT NULL";
          if (col.unique) def += " UNIQUE";
          if (col.default !== undefined) def += ` DEFAULT ${col.default}`;
          return def;
        })
        .join(", ");

      const sql = `CREATE TABLE "${table}" (${columnDefs})`;
      db.prepare(sql).run();
      return { success: true, table };
    }

    case "dropTable": {
      const { table } = params;
      db.prepare(`DROP TABLE "${table}"`).run();
      return { success: true, dropped: table };
    }

    case "alterTable": {
      const { table, action } = params;
      // SQLite only supports limited ALTER TABLE operations
      const sql = `ALTER TABLE "${table}" ${action}`;
      db.prepare(sql).run();
      return { success: true };
    }

    case "createIndex": {
      const { table, columns, indexName, unique = false } = params;
      const name = indexName || `idx_${table}_${columns.join("_")}`;
      const cols = columns.map((c: string) => `"${c}"`).join(", ");
      const sql = `CREATE ${unique ? "UNIQUE " : ""}INDEX "${name}" ON "${table}" (${cols})`;
      db.prepare(sql).run();
      return { success: true, index: name };
    }

    case "dropIndex": {
      const { indexName } = params;
      db.prepare(`DROP INDEX "${indexName}"`).run();
      return { success: true, dropped: indexName };
    }

    // === DML OPERATIONS ===

    case "query": {
      const { sql, params: queryParams = [] } = params;
      // Determine if it's a SELECT or modification query
      const trimmed = sql.trim().toUpperCase();
      if (trimmed.startsWith("SELECT") || trimmed.startsWith("PRAGMA")) {
        return db.prepare(sql).all(...queryParams);
      } else {
        const result = db.prepare(sql).run(...queryParams);
        return {
          success: true,
          changes: result.changes,
          lastInsertRowid: result.lastInsertRowid,
        };
      }
    }

    case "select": {
      const { table, columns = ["*"], where, orderBy, limit } = params;
      const cols = columns.join(", ");
      let sql = `SELECT ${cols} FROM "${table}"`;
      const values: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map((key) => `"${key}" = ?`);
        sql += ` WHERE ${conditions.join(" AND ")}`;
        values.push(...Object.values(where));
      }

      if (orderBy) sql += ` ORDER BY ${orderBy}`;
      if (limit) sql += ` LIMIT ${limit}`;

      return db.prepare(sql).all(...values);
    }

    case "insert": {
      const { table, data } = params;
      const columns = Object.keys(data)
        .map((k) => `"${k}"`)
        .join(", ");
      const placeholders = Object.keys(data)
        .map(() => "?")
        .join(", ");
      const values = Object.values(data);

      const sql = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`;
      const result = db.prepare(sql).run(...values);
      return {
        success: true,
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes,
      };
    }

    case "update": {
      const { table, data, where } = params;
      const sets = Object.keys(data)
        .map((key) => `"${key}" = ?`)
        .join(", ");
      const values = Object.values(data);

      let sql = `UPDATE "${table}" SET ${sets}`;

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map((key) => `"${key}" = ?`);
        sql += ` WHERE ${conditions.join(" AND ")}`;
        values.push(...Object.values(where));
      }

      const result = db.prepare(sql).run(...values);
      return { success: true, changes: result.changes };
    }

    case "delete": {
      const { table, where } = params;
      let sql = `DELETE FROM "${table}"`;
      const values: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map((key) => `"${key}" = ?`);
        sql += ` WHERE ${conditions.join(" AND ")}`;
        values.push(...Object.values(where));
      }

      const result = db.prepare(sql).run(...values);
      return { success: true, changes: result.changes };
    }

    case "bulkInsert": {
      const { table, data } = params;
      if (!Array.isArray(data) || data.length === 0) {
        return { success: true, changes: 0 };
      }

      const columns = Object.keys(data[0])
        .map((k) => `"${k}"`)
        .join(", ");
      const placeholders = Object.keys(data[0])
        .map(() => "?")
        .join(", ");
      const sql = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`;

      const stmt = db.prepare(sql);
      const transaction = db.transaction((rows: any[]) => {
        for (const row of rows) {
          stmt.run(...Object.values(row));
        }
      });

      transaction(data);
      return { success: true, changes: data.length };
    }

    // === TRANSACTIONS ===

    case "begin": {
      db.prepare("BEGIN TRANSACTION").run();
      return { success: true, message: "Transaction started" };
    }

    case "commit": {
      db.prepare("COMMIT").run();
      return { success: true, message: "Transaction committed" };
    }

    case "rollback": {
      db.prepare("ROLLBACK").run();
      return { success: true, message: "Transaction rolled back" };
    }

    // === MAINTENANCE ===

    case "vacuum": {
      db.prepare("VACUUM").run();
      return { success: true, message: "VACUUM completed" };
    }

    case "analyze": {
      const { table } = params;
      const sql = table ? `ANALYZE "${table}"` : "ANALYZE";
      db.prepare(sql).run();
      return {
        success: true,
        message: `ANALYZE completed${table ? ` for ${table}` : ""}`,
      };
    }

    case "integrityCheck": {
      const result = db.prepare("PRAGMA integrity_check").all();
      return result;
    }

    case "backup": {
      const { destination } = params;
      const backup = (db as any).backup(destination);

      backup.step();
      backup.finish();
      return { success: true, destination, message: "Backup completed" };
    }

    default:
      throw new Error(`Unknown sqlite tool: ${toolName}`);
  }
}

console.log("[SQLite Tools] 22+ tools loaded");
