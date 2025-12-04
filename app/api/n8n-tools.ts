// n8n MCP Tools - Full REST API Implementation
// Covers: Workflows, Executions, Nodes, Credentials, Tags, Webhooks, AI Building

import axios from 'axios';

function getClient() {
  if (!process.env.N8N_API_KEY) {
    throw new Error('N8N_API_KEY not configured');
  }
  
  const baseURL = process.env.N8N_BASE_URL || 'https://n8n.example.com';
  
  return axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
      'X-N8N-API-KEY': process.env.N8N_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}

export async function executeN8NTool(tool: string, params: any): Promise<any> {
  const client = getClient();

  switch (tool) {
    // ==================== WORKFLOW MANAGEMENT ====================
    case 'listWorkflows': {
      const { data } = await client.get('/workflows', {
        params: {
          active: params.active,
          tags: params.tags,
        },
      });
      return data;
    }

    case 'getWorkflow': {
      const { data } = await client.get(`/workflows/${params.workflowId}`);
      return data;
    }

    case 'createWorkflow': {
      const { data } = await client.post('/workflows', {
        name: params.name,
        nodes: params.nodes,
        connections: params.connections || {},
        settings: params.settings || {},
        staticData: params.staticData || {},
        tags: params.tags || [],
      });
      return data;
    }

    case 'updateWorkflow': {
      const { data } = await client.patch(`/workflows/${params.workflowId}`, {
        name: params.name,
        nodes: params.nodes,
        connections: params.connections,
        settings: params.settings,
        active: params.active,
      });
      return data;
    }

    case 'deleteWorkflow': {
      await client.delete(`/workflows/${params.workflowId}`);
      return { success: true, workflowId: params.workflowId };
    }

    case 'activateWorkflow': {
      const { data } = await client.patch(`/workflows/${params.workflowId}`, {
        active: true,
      });
      return data;
    }

    case 'deactivateWorkflow': {
      const { data } = await client.patch(`/workflows/${params.workflowId}`, {
        active: false,
      });
      return data;
    }

    // ==================== WORKFLOW EXECUTION ====================
    case 'executeWorkflow': {
      const { data } = await client.post(`/workflows/${params.workflowId}/execute`, {
        data: params.data || {},
      });
      return data;
    }

    case 'getExecution': {
      const { data } = await client.get(`/executions/${params.executionId}`);
      return data;
    }

    case 'listExecutions': {
      const { data } = await client.get('/executions', {
        params: {
          workflowId: params.workflowId,
          status: params.status,
          limit: params.limit || 20,
        },
      });
      return data;
    }

    case 'deleteExecution': {
      await client.delete(`/executions/${params.executionId}`);
      return { success: true, executionId: params.executionId };
    }

    // ==================== NODES ====================
    case 'listNodes': {
      const { data } = await client.get('/node-types');
      return data;
    }

    case 'getNodeInfo': {
      const { data } = await client.get(`/node-types/${params.nodeType}`);
      return data;
    }

    // ==================== CREDENTIALS ====================
    case 'listCredentials': {
      const { data } = await client.get('/credentials');
      return data;
    }

    case 'createCredential': {
      const { data } = await client.post('/credentials', {
        name: params.name,
        type: params.type,
        data: params.data,
      });
      return data;
    }

    case 'updateCredential': {
      const { data } = await client.patch(`/credentials/${params.credentialId}`, {
        name: params.name,
        data: params.data,
      });
      return data;
    }

    case 'deleteCredential': {
      await client.delete(`/credentials/${params.credentialId}`);
      return { success: true, credentialId: params.credentialId };
    }

    // ==================== TAGS ====================
    case 'listTags': {
      const { data } = await client.get('/tags');
      return data;
    }

    case 'createTag': {
      const { data } = await client.post('/tags', {
        name: params.name,
      });
      return data;
    }

    case 'updateTag': {
      const { data } = await client.patch(`/tags/${params.tagId}`, {
        name: params.name,
      });
      return data;
    }

    case 'deleteTag': {
      await client.delete(`/tags/${params.tagId}`);
      return { success: true, tagId: params.tagId };
    }

    // ==================== WEBHOOKS ====================
    case 'testWebhook': {
      const { data } = await client.post(`/webhooks/${params.webhookId}/test`, {
        data: params.data || {},
      });
      return data;
    }

    // ==================== AI-POWERED BUILDING ====================
    case 'buildWorkflowFromDescription': {
      // This uses AI to generate workflow from natural language
      // Note: This might be a custom endpoint or require OpenAI integration
      const { data } = await client.post('/workflows/generate', {
        description: params.description,
        model: params.model || 'gpt-4',
      });
      return data;
    }

    // ==================== WORKFLOW IMPORT/EXPORT ====================
    case 'exportWorkflow': {
      const { data } = await client.get(`/workflows/${params.workflowId}/export`);
      return data;
    }

    case 'importWorkflow': {
      const { data } = await client.post('/workflows/import', {
        workflow: params.workflow,
      });
      return data;
    }

    // ==================== WORKFLOW SHARING ====================
    case 'shareWorkflow': {
      const { data } = await client.post(`/workflows/${params.workflowId}/share`, {
        shareWithIds: params.shareWithIds || [],
      });
      return data;
    }

    case 'getWorkflowSharing': {
      const { data } = await client.get(`/workflows/${params.workflowId}/sharing`);
      return data;
    }

    // ==================== WORKFLOW VERSIONING ====================
    case 'getWorkflowVersions': {
      const { data } = await client.get(`/workflows/${params.workflowId}/versions`);
      return data;
    }

    case 'restoreWorkflowVersion': {
      const { data } = await client.post(
        `/workflows/${params.workflowId}/versions/${params.versionId}/restore`
      );
      return data;
    }

    // ==================== EXECUTION RETRY ====================
    case 'retryExecution': {
      const { data } = await client.post(`/executions/${params.executionId}/retry`);
      return data;
    }

    // ==================== BULK OPERATIONS ====================
    case 'bulkActivateWorkflows': {
      const results = await Promise.all(
        params.workflowIds.map((id: string) =>
          client.patch(`/workflows/${id}`, { active: true })
        )
      );
      return { success: true, count: results.length };
    }

    case 'bulkDeactivateWorkflows': {
      const results = await Promise.all(
        params.workflowIds.map((id: string) =>
          client.patch(`/workflows/${id}`, { active: false })
        )
      );
      return { success: true, count: results.length };
    }

    case 'bulkDeleteWorkflows': {
      const results = await Promise.all(
        params.workflowIds.map((id: string) => client.delete(`/workflows/${id}`))
      );
      return { success: true, count: results.length };
    }

    default:
      throw new Error(`Unknown n8n tool: ${tool}`);
  }
}

