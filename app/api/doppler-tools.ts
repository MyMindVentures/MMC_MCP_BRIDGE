// Doppler Secrets Manager - Full Implementation
// 15+ tools for complete secrets management
// API Docs: https://docs.doppler.com/reference

import axios from "axios";

const DOPPLER_API = "https://api.doppler.com/v3";

function getDopplerHeaders() {
  if (!process.env.DOPPLER_TOKEN) {
    throw new Error("DOPPLER_TOKEN not configured");
  }
  return {
    Authorization: `Bearer ${process.env.DOPPLER_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function executeDopplerTool(
  tool: string,
  params: any,
): Promise<any> {
  try {
    switch (tool) {
      // ========== PROJECTS ==========
      case "listProjects":
        return await listProjects();

      case "getProject":
        return await getProject(params.project);

      case "createProject":
        return await createProject(params.name, params.description);

      case "updateProject":
        return await updateProject(
          params.project,
          params.name,
          params.description,
        );

      case "deleteProject":
        return await deleteProject(params.project);

      // ========== CONFIGS (ENVIRONMENTS) ==========
      case "listConfigs":
        return await listConfigs(params.project);

      case "getConfig":
        return await getConfig(params.project, params.config);

      case "createConfig":
        return await createConfig(
          params.project,
          params.name,
          params.environment,
        );

      case "updateConfig":
        return await updateConfig(params.project, params.config, params.name);

      case "deleteConfig":
        return await deleteConfig(params.project, params.config);

      case "cloneConfig":
        return await cloneConfig(params.project, params.config, params.newName);

      case "lockConfig":
        return await lockConfig(params.project, params.config);

      case "unlockConfig":
        return await unlockConfig(params.project, params.config);

      // ========== SECRETS ==========
      case "listSecrets":
        return await listSecrets(params.project, params.config);

      case "getSecret":
        return await getSecret(params.project, params.config, params.name);

      case "setSecret":
        return await setSecret(
          params.project,
          params.config,
          params.name,
          params.value,
        );

      case "updateSecret":
        return await updateSecret(
          params.project,
          params.config,
          params.name,
          params.value,
        );

      case "deleteSecret":
        return await deleteSecret(params.project, params.config, params.name);

      case "bulkSetSecrets":
        return await bulkSetSecrets(
          params.project,
          params.config,
          params.secrets,
        );

      case "downloadSecrets":
        return await downloadSecrets(
          params.project,
          params.config,
          params.format,
        );

      // ========== ENVIRONMENTS ==========
      case "listEnvironments":
        return await listEnvironments(params.project);

      case "createEnvironment":
        return await createEnvironment(
          params.project,
          params.name,
          params.slug,
        );

      case "renameEnvironment":
        return await renameEnvironment(
          params.project,
          params.slug,
          params.name,
        );

      case "deleteEnvironment":
        return await deleteEnvironment(params.project, params.slug);

      // ========== SERVICE TOKENS ==========
      case "listServiceTokens":
        return await listServiceTokens(params.project, params.config);

      case "createServiceToken":
        return await createServiceToken(
          params.project,
          params.config,
          params.name,
          params.access,
        );

      case "deleteServiceToken":
        return await deleteServiceToken(params.slug);

      // ========== INTEGRATIONS ==========
      case "listIntegrations":
        return await listIntegrations(params.project);

      case "createIntegration":
        return await createIntegration(
          params.project,
          params.type,
          params.data,
        );

      case "deleteIntegration":
        return await deleteIntegration(params.integration);

      // ========== AUDIT LOGS ==========
      case "getAuditLogs":
        return await getAuditLogs(params.page, params.perPage);

      // ========== WORKPLACE ==========
      case "getWorkplace":
        return await getWorkplace();

      case "listWorkplaceUsers":
        return await listWorkplaceUsers();

      default:
        throw new Error(`Unknown Doppler tool: ${tool}`);
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Doppler API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
      );
    }
    throw error;
  }
}

// ========== PROJECTS ==========

async function listProjects() {
  const response = await axios.get(`${DOPPLER_API}/projects`, {
    headers: getDopplerHeaders(),
  });
  return response.data.projects;
}

async function getProject(project: string) {
  const response = await axios.get(`${DOPPLER_API}/projects/project`, {
    headers: getDopplerHeaders(),
    params: { project },
  });
  return response.data.project;
}

async function createProject(name: string, description?: string) {
  const response = await axios.post(
    `${DOPPLER_API}/projects`,
    {
      name,
      description,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.project;
}

async function updateProject(
  project: string,
  name?: string,
  description?: string,
) {
  const response = await axios.post(
    `${DOPPLER_API}/projects/project`,
    {
      project,
      name,
      description,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.project;
}

async function deleteProject(project: string) {
  const response = await axios.delete(`${DOPPLER_API}/projects/project`, {
    headers: getDopplerHeaders(),
    params: { project },
  });
  return { success: true, message: `Project ${project} deleted` };
}

// ========== CONFIGS ==========

async function listConfigs(project: string) {
  const response = await axios.get(`${DOPPLER_API}/configs`, {
    headers: getDopplerHeaders(),
    params: { project },
  });
  return response.data.configs;
}

async function getConfig(project: string, config: string) {
  const response = await axios.get(`${DOPPLER_API}/configs/config`, {
    headers: getDopplerHeaders(),
    params: { project, config },
  });
  return response.data.config;
}

async function createConfig(
  project: string,
  name: string,
  environment: string,
) {
  const response = await axios.post(
    `${DOPPLER_API}/configs`,
    {
      project,
      name,
      environment,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.config;
}

async function updateConfig(project: string, config: string, name: string) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config`,
    {
      project,
      config,
      name,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.config;
}

async function deleteConfig(project: string, config: string) {
  const response = await axios.delete(`${DOPPLER_API}/configs/config`, {
    headers: getDopplerHeaders(),
    params: { project, config },
  });
  return { success: true, message: `Config ${config} deleted` };
}

async function cloneConfig(project: string, config: string, newName: string) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/clone`,
    {
      project,
      config,
      name: newName,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.config;
}

async function lockConfig(project: string, config: string) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/lock`,
    {
      project,
      config,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.config;
}

async function unlockConfig(project: string, config: string) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/unlock`,
    {
      project,
      config,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.config;
}

// ========== SECRETS ==========

async function listSecrets(project: string, config: string) {
  const response = await axios.get(`${DOPPLER_API}/configs/config/secrets`, {
    headers: getDopplerHeaders(),
    params: { project, config },
  });
  return response.data.secrets;
}

async function getSecret(project: string, config: string, name: string) {
  const response = await axios.get(`${DOPPLER_API}/configs/config/secret`, {
    headers: getDopplerHeaders(),
    params: { project, config, name },
  });
  return response.data.secret;
}

async function setSecret(
  project: string,
  config: string,
  name: string,
  value: string,
) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/secrets`,
    {
      project,
      config,
      secrets: { [name]: value },
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data;
}

async function updateSecret(
  project: string,
  config: string,
  name: string,
  value: string,
) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/secret`,
    {
      project,
      config,
      name,
      value,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.secret;
}

async function deleteSecret(project: string, config: string, name: string) {
  const response = await axios.delete(`${DOPPLER_API}/configs/config/secret`, {
    headers: getDopplerHeaders(),
    params: { project, config, name },
  });
  return { success: true, message: `Secret ${name} deleted` };
}

async function bulkSetSecrets(
  project: string,
  config: string,
  secrets: Record<string, string>,
) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/secrets`,
    {
      project,
      config,
      secrets,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data;
}

async function downloadSecrets(
  project: string,
  config: string,
  format: string = "json",
) {
  const response = await axios.get(
    `${DOPPLER_API}/configs/config/secrets/download`,
    {
      headers: getDopplerHeaders(),
      params: { project, config, format },
    },
  );
  return response.data;
}

// ========== ENVIRONMENTS ==========

async function listEnvironments(project: string) {
  const response = await axios.get(`${DOPPLER_API}/environments`, {
    headers: getDopplerHeaders(),
    params: { project },
  });
  return response.data.environments;
}

async function createEnvironment(project: string, name: string, slug: string) {
  const response = await axios.post(
    `${DOPPLER_API}/environments`,
    {
      project,
      name,
      slug,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.environment;
}

async function renameEnvironment(project: string, slug: string, name: string) {
  const response = await axios.put(
    `${DOPPLER_API}/environments/environment`,
    {
      project,
      slug,
      name,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.environment;
}

async function deleteEnvironment(project: string, slug: string) {
  const response = await axios.delete(
    `${DOPPLER_API}/environments/environment`,
    {
      headers: getDopplerHeaders(),
      params: { project, slug },
    },
  );
  return { success: true, message: `Environment ${slug} deleted` };
}

// ========== SERVICE TOKENS ==========

async function listServiceTokens(project: string, config: string) {
  const response = await axios.get(`${DOPPLER_API}/configs/config/tokens`, {
    headers: getDopplerHeaders(),
    params: { project, config },
  });
  return response.data.tokens;
}

async function createServiceToken(
  project: string,
  config: string,
  name: string,
  access: string = "read",
) {
  const response = await axios.post(
    `${DOPPLER_API}/configs/config/tokens`,
    {
      project,
      config,
      name,
      access,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.token;
}

async function deleteServiceToken(slug: string) {
  const response = await axios.delete(
    `${DOPPLER_API}/configs/config/tokens/token`,
    {
      headers: getDopplerHeaders(),
      params: { slug },
    },
  );
  return { success: true, message: `Service token ${slug} deleted` };
}

// ========== INTEGRATIONS ==========

async function listIntegrations(project: string) {
  const response = await axios.get(`${DOPPLER_API}/integrations`, {
    headers: getDopplerHeaders(),
    params: { project },
  });
  return response.data.integrations;
}

async function createIntegration(project: string, type: string, data: any) {
  const response = await axios.post(
    `${DOPPLER_API}/integrations`,
    {
      project,
      type,
      data,
    },
    {
      headers: getDopplerHeaders(),
    },
  );
  return response.data.integration;
}

async function deleteIntegration(integration: string) {
  const response = await axios.delete(
    `${DOPPLER_API}/integrations/integration`,
    {
      headers: getDopplerHeaders(),
      params: { integration },
    },
  );
  return { success: true, message: `Integration ${integration} deleted` };
}

// ========== AUDIT LOGS ==========

async function getAuditLogs(page: number = 1, perPage: number = 20) {
  const response = await axios.get(`${DOPPLER_API}/logs`, {
    headers: getDopplerHeaders(),
    params: { page, per_page: perPage },
  });
  return response.data;
}

// ========== WORKPLACE ==========

async function getWorkplace() {
  const response = await axios.get(`${DOPPLER_API}/workplace`, {
    headers: getDopplerHeaders(),
  });
  return response.data.workplace;
}

async function listWorkplaceUsers() {
  const response = await axios.get(`${DOPPLER_API}/workplace/users`, {
    headers: getDopplerHeaders(),
  });
  return response.data.users;
}
