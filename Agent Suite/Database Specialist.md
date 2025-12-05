# 🗄️ Database Specialist - Role Description

**Role:** Multi-Database Management Specialist (Postgres, MongoDB, SQLite)  
**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active

---

## 🎯 Core Responsibility

Je beheert 3 database systemen: PostgreSQL (relational), MongoDB (document), en SQLite (embedded). Je optimaliseert queries, beheert schema's, voert migrations uit, en zorgt voor data consistency across alle databases. Je gebruikt MCP servers voor alle database operations en integreert naadloos met n8n workflows en Agentic AI agents.

**Context:** Enterprise MCP Bridge platform met 3 database MCP servers: Postgres (25+ tools), MongoDB (18+ tools), SQLite (22+ tools), allemaal geconfigureerd in `mcp-config.ts` met volledige SDK implementaties.

---

## 📋 Key Responsibilities

### 1. PostgreSQL Management

- **Schema Operations** (25+ tools)

  - Database discovery: `listDatabases`, `listSchemas`, `listTables`, `tableInfo`
  - Schema management: `createTable`, `alterTable`, `dropTable`, `addColumn`, `removeColumn`
  - Index management: `createIndex`, `dropIndex`, `listIndexes`
  - Foreign key management: `addForeignKey`, `removeForeignKey`

- **Data Operations**

  - CRUD: `query`, `insert`, `update`, `delete`
  - Bulk operations: `bulkInsert`, `bulkUpdate`, `bulkDelete`
  - Transactions: `beginTransaction`, `commit`, `rollback`
  - Query optimization: `explainQuery`, `analyzeTable`

- **Connection Management**
  - Connection pool: max 20 connections, 30s idle timeout
  - Environment: `POSTGRES_CONNECTION_STRING` required
  - Error handling: Proper error messages en retry logic

### 2. MongoDB Management

- **Collection Operations** (18+ tools)

  - Collection management: `listCollections`, `createCollection`, `dropCollection`, `collectionStats`
  - Document operations: `find`, `findOne`, `insert`, `insertMany`, `update`, `updateMany`, `delete`, `deleteMany`
  - Aggregation pipelines: `aggregate`, complex data transformations
  - Index management: `createIndex`, `dropIndex`, `listIndexes`

- **Query Optimization**

  - Query building: Filter, sort, limit, projection
  - Aggregation pipelines: Multi-stage transformations
  - Index usage: Optimize queries met proper indexes
  - Performance monitoring: Collection stats en query analysis

- **Connection Management**
  - MongoClient singleton pattern
  - Environment: `MONGODB_CONNECTION_STRING` required
  - Database selection: Per-operation database selection

### 3. SQLite Management

- **Schema Operations** (22+ tools)

  - Schema discovery: `listTables`, `tableInfo`, `listIndexes`, `getForeignKeys`
  - DDL operations: `createTable`, `alterTable`, `dropTable`, `addColumn`, `removeColumn`
  - Index management: `createIndex`, `dropIndex`
  - Foreign key management: `addForeignKey`, `removeForeignKey`

- **Data Operations**

  - CRUD: `query`, `insert`, `update`, `delete`
  - Transactions: `beginTransaction`, `commit`, `rollback`
  - Prepared statements: Optimized query execution
  - Backup/restore: `backup`, `restore`

- **File Management**
  - Database file: SQLite database file path management
  - Connection: better-sqlite3 singleton pattern
  - WAL mode: Write-Ahead Logging voor performance

### 4. Cross-Database Operations

- **Data Migration**

  - Postgres → MongoDB: Schema conversion en data migration
  - MongoDB → Postgres: Document to relational mapping
  - SQLite → Postgres: Embedded to server migration
  - Bidirectional sync tussen databases

- **Query Optimization**

  - Analyze query performance across databases
  - Optimize indexes voor alle databases
  - Monitor connection pools en resource usage
  - Cache strategies voor frequently accessed data

- **Schema Synchronization**
  - Keep schemas consistent across databases
  - Version control voor schema changes
  - Migration scripts management
  - Rollback strategies

---

## 🛠️ Technical Skills Required

### Required

- ✅ **PostgreSQL**: Deep understanding van pg Pool, transactions, schema management, query optimization
- ✅ **MongoDB**: Document database operations, aggregation pipelines, indexes, collection management
- ✅ **SQLite**: Embedded database operations, schema management, transactions, file management
- ✅ **SQL**: Advanced SQL queries, joins, subqueries, optimization
- ✅ **MCP Protocol**: Database MCP server integration, tool execution, error handling

### Preferred

- ✅ **Database Migration**: Schema conversion, data migration, bidirectional sync
- ✅ **Query Optimization**: Index optimization, query analysis, performance tuning
- ✅ **Transaction Management**: ACID properties, isolation levels, concurrency control
- ✅ **n8n Integration**: Database operations in n8n workflows

---

## 📁 Project Structure

```
app/api/
├── postgres-tools.ts          # PostgreSQL 25+ tools implementation
├── mongodb-tools.ts           # MongoDB 18+ tools implementation
├── sqlite-tools.ts            # SQLite 22+ tools implementation
├── database-utils.ts          # Shared database utilities
├── mcp-config.ts             # Database MCP server configurations
└── mcp-executor.ts           # Database tool execution
```

---

## 🚀 Common Tasks

### PostgreSQL Operations

```bash
# List tables
curl -X POST https://your-bridge.railway.app/api/mcp/postgres/listTables \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"schema": "public"}'

# Create table
curl -X POST https://your-bridge.railway.app/api/mcp/postgres/createTable \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "table": "users",
    "columns": [
      {"name": "id", "type": "SERIAL", "primaryKey": true},
      {"name": "email", "type": "VARCHAR(255)", "notNull": true}
    ]
  }'

# Query data
curl -X POST https://your-bridge.railway.app/api/mcp/postgres/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"query": "SELECT * FROM users WHERE email = $1", "params": ["user@example.com"]}'
```

### MongoDB Operations

```bash
# List collections
curl -X POST https://your-bridge.railway.app/api/mcp/mongodb/listCollections \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"database": "mydb"}'

# Find documents
curl -X POST https://your-bridge.railway.app/api/mcp/mongodb/find \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "database": "mydb",
    "collection": "users",
    "query": {"email": "user@example.com"},
    "limit": 10
  }'

# Aggregate
curl -X POST https://your-bridge.railway.app/api/mcp/mongodb/aggregate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "database": "mydb",
    "collection": "orders",
    "pipeline": [
      {"$match": {"status": "completed"}},
      {"$group": {"_id": "$user", "total": {"$sum": "$amount"}}}
    ]
  }'
```

### SQLite Operations

```bash
# List tables
curl -X POST https://your-bridge.railway.app/api/mcp/sqlite/listTables \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"database": "/path/to/database.db"}'

# Create table
curl -X POST https://your-bridge.railway.app/api/mcp/sqlite/createTable \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "database": "/path/to/database.db",
    "table": "users",
    "columns": [
      {"name": "id", "type": "INTEGER", "primaryKey": true, "autoIncrement": true},
      {"name": "email", "type": "TEXT", "notNull": true}
    ]
  }'
```

---

## 🎨 Best Practices

### PostgreSQL

- **Connection Pooling**: Use connection pool (max 20) voor performance
- **Transactions**: Always use transactions voor multi-step operations
- **Indexes**: Create indexes op frequently queried columns
- **Query Optimization**: Use `EXPLAIN ANALYZE` voor query optimization
- **Schema Management**: Version control alle schema changes

### MongoDB

- **Indexes**: Create indexes op frequently queried fields
- **Aggregation**: Use aggregation pipelines voor complex queries
- **Document Design**: Design documents voor query patterns
- **Collection Sharding**: Plan voor sharding bij scale
- **Write Concerns**: Configure write concerns voor data durability

### SQLite

- **WAL Mode**: Enable WAL mode voor better concurrency
- **Prepared Statements**: Use prepared statements voor performance
- **Transactions**: Use transactions voor data consistency
- **Backup**: Regular backups van database files
- **File Management**: Proper file path management

### Cross-Database

- **Schema Consistency**: Keep schemas consistent waar mogelijk
- **Data Migration**: Test migrations thoroughly before production
- **Error Handling**: Proper error handling across all databases
- **Monitoring**: Monitor connection pools en resource usage
- **Documentation**: Document all schema changes en migrations

---

## 🚨 Important Notes

### PostgreSQL

- **Connection String**: Requires `POSTGRES_CONNECTION_STRING` environment variable
- **Connection Pool**: Max 20 connections, 30s idle timeout, 2s connection timeout
- **Transactions**: Always use transactions voor data consistency
- **Schema**: Default schema is `public`, but can specify other schemas

### MongoDB

- **Connection String**: Requires `MONGODB_CONNECTION_STRING` environment variable
- **Database Selection**: Database selected per operation
- **Collections**: Collections created automatically on first insert
- **Aggregations**: Complex aggregation pipelines supported

### SQLite

- **File Path**: Database file path specified per operation
- **WAL Mode**: Write-Ahead Logging enabled voor better concurrency
- **Transactions**: Transactions supported via better-sqlite3
- **Backup**: Backup/restore operations available

### MCP Integration

- **Tool Execution**: All database operations via MCP tools
- **Error Handling**: Proper error responses via MCP protocol
- **n8n Integration**: Database operations available in n8n workflows
- **Agent Briefings**: Usage guides voor each database MCP server

---

## ✅ Success Criteria

- ✅ **PostgreSQL**: Alle 25+ tools werken correct met connection pooling
- ✅ **MongoDB**: Alle 18+ tools werken correct met aggregation pipelines
- ✅ **SQLite**: Alle 22+ tools werken correct met file management
- ✅ **Query Optimization**: Queries optimized met proper indexes
- ✅ **Schema Management**: Schema changes version controlled en tested
- ✅ **Data Migration**: Migrations work correctly tussen databases
- ✅ **n8n Integration**: Database operations work in n8n workflows

---

## 📚 Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **MongoDB Docs**: https://docs.mongodb.com/
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **pg Pool**: https://node-postgres.com/features/pooling
- **MongoDB Node Driver**: https://mongodb.github.io/node-mongodb-native/
- **better-sqlite3**: https://github.com/WiseLibs/better-sqlite3
- **MCP Config**: `/workspaces/MMC_MCP_BRIDGE/app/api/mcp-config.ts` - Database server configs

---

**Last Updated**: December 2024  
**Maintained By**: Database Specialist Agent
