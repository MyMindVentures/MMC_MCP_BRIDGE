// Airtable MCP Tools - Full Implementation
// Covers: Records (CRUD), Bulk Operations, Fields, Views, Tables, Search

import Airtable from 'airtable';

// Singleton Airtable client
let airtableClient: Airtable | null = null;

function getClient(): Airtable {
  if (!airtableClient) {
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }
    airtableClient = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
  }
  return airtableClient;
}

export async function executeAirtableTool(tool: string, params: any): Promise<any> {
  const client = getClient();
  const base = client.base(params.baseId);

  switch (tool) {
    // ==================== RECORD OPERATIONS ====================
    case 'listRecords': {
      const table = base(params.table);
      const records = await table
        .select({
          maxRecords: params.maxRecords || 100,
          view: params.view,
          filterByFormula: params.filterByFormula,
          sort: params.sort,
          fields: params.fields,
        })
        .all();

      return records.map(record => ({
        id: (record as any).id,
        fields: record.fields,
        createdTime: (record as any)._rawJson?.createdTime,
      }));
    }

    case 'getRecord': {
      const table = base(params.table);
      const record = await table.find(params.recordId);

      return {
        id: (record as any).id,
        fields: record.fields,
        createdTime: (record as any)._rawJson?.createdTime,
      };
    }

    case 'createRecord': {
      const table = base(params.table);
      const record = await table.create(params.fields, {
        typecast: params.typecast !== false,
      });

      return {
        id: (record as any).id,
        fields: (record as any).fields,
        createdTime: (record as any)._rawJson?.createdTime,
      };
    }

    case 'updateRecord': {
      const table = base(params.table);
      const record = await table.update(params.recordId, params.fields, {
        typecast: params.typecast !== false,
      });

      return {
        id: (record as any).id,
        fields: (record as any).fields,
      };
    }

    case 'deleteRecord': {
      const table = base(params.table);
      const deleted = await table.destroy(params.recordId);

      return {
        id: deleted.id,
        deleted: true,
      };
    }

    // ==================== BULK OPERATIONS ====================
    case 'bulkCreate': {
      const table = base(params.table);
      const records = await table.create(
        params.records.map((r: any) => ({ fields: r })),
        { typecast: params.typecast !== false }
      );

      return (records as any).map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
    }

    case 'bulkUpdate': {
      const table = base(params.table);
      const records = await table.update(
        params.records.map((r: any) => ({
          id: r.id,
          fields: r.fields,
        })),
        { typecast: params.typecast !== false }
      );

      return (records as any).map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
    }

    case 'bulkDelete': {
      const table = base(params.table);
      const deleted = await table.destroy(params.recordIds);

      return (deleted as any).map((record: any) => ({
        id: record.id,
        deleted: true,
      }));
    }

    // ==================== SEARCH & FILTER ====================
    case 'filterRecords': {
      const table = base(params.table);
      const records = await table
        .select({
          filterByFormula: params.formula,
          maxRecords: params.maxRecords || 100,
          view: params.view,
        })
        .all();

      return (records as any).map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
    }

    case 'sortRecords': {
      const table = base(params.table);
      const records = await table
        .select({
          sort: params.sort, // [{ field: 'Name', direction: 'asc' }]
          maxRecords: params.maxRecords || 100,
        })
        .all();

      return (records as any).map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
    }

    case 'searchRecords': {
      const table = base(params.table);
      
      // Build search formula
      const searchFields = params.searchFields || [];
      const searchTerm = params.searchTerm;
      
      let formula = '';
      if (searchFields.length > 0) {
        const conditions = searchFields.map(
          (field: string) => `SEARCH(LOWER("${searchTerm}"), LOWER({${field}}))`
        );
        formula = `OR(${conditions.join(', ')})`;
      }

      const records = await table
        .select({
          filterByFormula: formula,
          maxRecords: params.maxRecords || 100,
        })
        .all();

      return (records as any).map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
    }

    // ==================== FIELDS (via Metadata API) ====================
    case 'listFields': {
      // Note: Airtable Metadata API requires separate authentication
      // This is a simplified version using the base schema
      const table = base(params.table);
      const records = await table.select({ maxRecords: 1 }).firstPage();

      if (records.length === 0) {
        return { fields: [] };
      }

      const fields = Object.keys((records[0] as any).fields).map((fieldName: string) => ({
        name: fieldName,
        type: typeof (records[0] as any).fields[fieldName],
      }));

      return { fields };
    }

    case 'getFieldInfo': {
      // Get info about a specific field by examining records
      const table = base(params.table);
      const records = await table.select({ maxRecords: 10 }).firstPage();

      const fieldName = params.fieldName;
      const values = (records as any)
        .map((r: any) => r.fields[fieldName])
        .filter((v: any) => v !== undefined && v !== null);

      return {
        fieldName,
        sampleValues: values.slice(0, 5),
        valueCount: values.length,
        types: [...new Set(values.map(v => typeof v))],
      };
    }

    // ==================== VIEWS ====================
    case 'listViews': {
      // Note: View listing requires Metadata API
      // This returns records from a specific view
      const table = base(params.table);
      const records = await table
        .select({
          view: params.view,
          maxRecords: params.maxRecords || 100,
        })
        .all();

      return {
        view: params.view,
        recordCount: records.length,
        records: (records as any).map((r: any) => ({
          id: r.id,
          fields: r.fields,
        })),
      };
    }

    case 'getView': {
      const table = base(params.table);
      const records = await table
        .select({
          view: params.view,
          maxRecords: params.maxRecords || 100,
        })
        .all();

      return {
        view: params.view,
        recordCount: records.length,
        records: (records as any).map((r: any) => ({
          id: r.id,
          fields: r.fields,
        })),
      };
    }

    // ==================== TABLES ====================
    case 'listTables': {
      // Note: This requires base schema access
      // Returns a simplified version
      return {
        baseId: params.baseId,
        message: 'Use Airtable Metadata API for full table listing',
      };
    }

    case 'getTableInfo': {
      const table = base(params.table);
      const records = await table.select({ maxRecords: 1 }).firstPage();

      if (records.length === 0) {
        return {
          table: params.table,
          recordCount: 0,
          fields: [],
        };
      }

      const fields = Object.keys(records[0].fields);

      return {
        table: params.table,
        fields,
        sampleRecord: {
          id: records[0].id,
          fields: records[0].fields,
        },
      };
    }

    // ==================== PAGINATION ====================
    case 'getPage': {
      const table = base(params.table);
      const pageSize = params.pageSize || 100;
      
      let records;
      if (params.offset) {
        records = await table
          .select({
            maxRecords: pageSize,
            offset: params.offset,
            view: params.view,
          })
          .firstPage();
      } else {
        records = await table
          .select({
            maxRecords: pageSize,
            view: params.view,
          })
          .firstPage();
      }

      return {
        records: records.map(r => ({
          id: r.id,
          fields: r.fields,
        })),
        count: records.length,
      };
    }

    // ==================== ADVANCED ====================
    case 'replaceRecord': {
      // Replace (PUT) instead of update (PATCH)
      const table = base(params.table);
      const record = await table.replace(params.recordId, params.fields);

      return {
        id: (record as any).id,
        fields: (record as any).fields,
      };
    }

    case 'upsertRecord': {
      // Upsert: update if exists, create if not
      const table = base(params.table);
      
      try {
        // Try to find existing record
        const existing = await table.find(params.recordId);
        const updated = await table.update(params.recordId, params.fields);
        return {
          id: updated.id,
          fields: updated.fields,
          action: 'updated',
        };
      } catch (error: any) {
        // Record doesn't exist, create it
        if (error.statusCode === 404) {
          const created = await table.create(params.fields);
          return {
            id: (created as any).id,
            fields: (created as any).fields,
            action: 'created',
          };
        }
        throw error;
      }
    }

    default:
      throw new Error(`Unknown Airtable tool: ${tool}`);
  }
}

