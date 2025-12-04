// n8n MCP Tools - Full REST API Implementation
// Covers: Workflows, Executions, Nodes, Credentials, Tags, Webhooks, AI Building

import axios from 'axios';

function getClient() {
  // Support both N8N_INSTANCE_APIKEY (new) and N8N_API_KEY (legacy)
  const apiKey = process.env.N8N_INSTANCE_APIKEY || process.env.N8N_API_KEY;
  
  if (!apiKey) {
    throw new Error('N8N_INSTANCE_APIKEY or N8N_API_KEY not configured');
  }
  
  // Use N8N_BASE_URL or default to Railway instance
  const baseURL = process.env.N8N_BASE_URL || 'https://mmc-n8n-instance.up.railway.app';
  
  return axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
      'X-N8N-API-KEY': apiKey,
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
      // AI-powered workflow generation from natural language
      // Uses OpenAI to convert description to n8n workflow JSON
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY required for AI workflow building');
      }

      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Get available nodes for context
      const { data: nodes } = await client.get('/node-types');
      const nodeList = nodes.map((n: any) => n.name).slice(0, 100); // Top 100 most common

      const prompt = `You are an n8n workflow expert. Convert this natural language description into a complete n8n workflow JSON.

Description: ${params.description}

Available nodes (sample): ${nodeList.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeName",
      "typeVersion": 1,
      "position": [x, y]
    }
  ],
  "connections": {
    "Node Name": {
      "main": [[{"node": "Next Node", "type": "main", "index": 0}]]
    }
  },
  "settings": {},
  "staticData": null
}

Make it production-ready with proper error handling and realistic parameters.`;

      const completion = await openai.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an n8n workflow architect. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      const workflowJson = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Create the workflow in n8n
      const { data: createdWorkflow } = await client.post('/workflows', workflowJson);
      
      return {
        workflow: createdWorkflow,
        description: params.description,
        aiGenerated: true,
        model: params.model || 'gpt-4',
      };
    }

    case 'explainWorkflow': {
      // AI-powered workflow explanation
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY required for AI workflow explanation');
      }

      const { data: workflow } = await client.get(`/workflows/${params.workflowId}`);
      
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Explain this n8n workflow in simple terms:

Workflow: ${workflow.name}
Nodes: ${JSON.stringify(workflow.nodes, null, 2)}
Connections: ${JSON.stringify(workflow.connections, null, 2)}

Provide:
1. What this workflow does (1-2 sentences)
2. Step-by-step breakdown
3. Potential improvements
4. Common use cases`;

      const completion = await openai.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an n8n expert. Explain workflows clearly.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      });

      return {
        workflowId: params.workflowId,
        workflowName: workflow.name,
        explanation: completion.choices[0].message.content,
      };
    }

    case 'optimizeWorkflow': {
      // AI-powered workflow optimization
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY required for AI workflow optimization');
      }

      const { data: workflow } = await client.get(`/workflows/${params.workflowId}`);
      
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Optimize this n8n workflow for performance and reliability:

${JSON.stringify(workflow, null, 2)}

Provide:
1. Optimized workflow JSON
2. List of changes made
3. Performance improvements
4. Best practices applied

Return JSON: { "optimizedWorkflow": {...}, "changes": [...], "improvements": [...] }`;

      const completion = await openai.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an n8n optimization expert. Return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Update the workflow
      if (params.applyChanges) {
        await client.patch(`/workflows/${params.workflowId}`, result.optimizedWorkflow);
      }

      return {
        workflowId: params.workflowId,
        ...result,
        applied: params.applyChanges || false,
      };
    }

    case 'suggestNodes': {
      // AI-powered node suggestions based on context
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY required for AI node suggestions');
      }

      const { data: nodes } = await client.get('/node-types');
      
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Given this workflow context: "${params.context}"

From these available n8n nodes: ${nodes.map((n: any) => n.name).slice(0, 200).join(', ')}

Suggest the 5 best nodes to use and explain why.

Return JSON: [{"node": "nodeName", "reason": "why", "parameters": {...}}]`;

      const completion = await openai.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an n8n node expert. Return valid JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
      });

      return {
        context: params.context,
        suggestions: JSON.parse(completion.choices[0].message.content || '[]'),
      };
    }

    case 'debugWorkflowWithAI': {
      // AI-powered workflow debugging
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY required for AI debugging');
      }

      const { data: execution } = await client.get(`/executions/${params.executionId}`);
      
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Debug this failed n8n workflow execution:

Execution: ${JSON.stringify(execution, null, 2)}

Provide:
1. Root cause analysis
2. Specific fix recommendations
3. Code examples if needed
4. Prevention strategies`;

      const completion = await openai.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an n8n debugging expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      return {
        executionId: params.executionId,
        analysis: completion.choices[0].message.content,
      };
    }

    case 'convertToWorkflow': {
      // Convert various formats to n8n workflow
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Convert this ${params.sourceType} to an n8n workflow:

${params.source}

Return valid n8n workflow JSON with proper nodes and connections.`;

      const completion = await openai.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an n8n workflow converter. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      });

      const workflowJson = JSON.parse(completion.choices[0].message.content || '{}');
      
      if (params.createWorkflow) {
        const { data: created } = await client.post('/workflows', workflowJson);
        return { workflow: created, converted: true };
      }

      return { workflowJson, preview: true };
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

