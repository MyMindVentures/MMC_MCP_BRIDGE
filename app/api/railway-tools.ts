// Railway MCP Tools - Full Implementation
// Covers: Projects, Services, Deployments, Environments, Variables, Volumes, Domains, Metrics

import axios from "axios";

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";

function getHeaders(): Record<string, string> {
  if (!process.env.RAILWAY_TOKEN) {
    throw new Error("RAILWAY_TOKEN not configured");
  }
  return {
    Authorization: `Bearer ${process.env.RAILWAY_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function gql(query: string, variables?: any): Promise<any> {
  const response = await axios.post(
    RAILWAY_API,
    { query, variables },
    { headers: getHeaders() },
  );

  if (response.data.errors) {
    throw new Error(
      `Railway GraphQL error: ${JSON.stringify(response.data.errors)}`,
    );
  }

  return response.data.data;
}

export async function executeRailwayTool(
  tool: string,
  params: any,
): Promise<any> {
  switch (tool) {
    // ==================== PROJECTS ====================
    case "listProjects": {
      const query = `
        query {
          projects {
            edges {
              node {
                id
                name
                description
                createdAt
                updatedAt
              }
            }
          }
        }
      `;
      const data = await gql(query);
      return data.projects.edges.map((e: any) => e.node);
    }

    case "getProject": {
      const query = `
        query($id: String!) {
          project(id: $id) {
            id
            name
            description
            createdAt
            updatedAt
            services {
              edges {
                node {
                  id
                  name
                }
              }
            }
            environments {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { id: params.projectId });
      return data.project;
    }

    case "createProject": {
      const query = `
        mutation($input: ProjectCreateInput!) {
          projectCreate(input: $input) {
            id
            name
            description
          }
        }
      `;
      const data = await gql(query, {
        input: {
          name: params.name,
          description: params.description,
        },
      });
      return data.projectCreate;
    }

    case "deleteProject": {
      const query = `
        mutation($id: String!) {
          projectDelete(id: $id)
        }
      `;
      const data = await gql(query, { id: params.projectId });
      return { success: data.projectDelete, projectId: params.projectId };
    }

    // ==================== SERVICES ====================
    case "listServices": {
      const query = `
        query($projectId: String!) {
          project(id: $projectId) {
            services {
              edges {
                node {
                  id
                  name
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { projectId: params.projectId });
      return data.project.services.edges.map((e: any) => e.node);
    }

    case "getService": {
      const query = `
        query($id: String!) {
          service(id: $id) {
            id
            name
            createdAt
            updatedAt
            deployments {
              edges {
                node {
                  id
                  status
                  createdAt
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { id: params.serviceId });
      return data.service;
    }

    case "createService": {
      const query = `
        mutation($input: ServiceCreateInput!) {
          serviceCreate(input: $input) {
            id
            name
          }
        }
      `;
      const data = await gql(query, {
        input: {
          projectId: params.projectId,
          name: params.name,
          source: params.source,
        },
      });
      return data.serviceCreate;
    }

    case "deleteService": {
      const query = `
        mutation($id: String!) {
          serviceDelete(id: $id)
        }
      `;
      const data = await gql(query, { id: params.serviceId });
      return { success: data.serviceDelete, serviceId: params.serviceId };
    }

    // ==================== DEPLOYMENTS ====================
    case "deployService": {
      const query = `
        mutation($serviceId: String!) {
          serviceInstanceRedeploy(serviceId: $serviceId) {
            id
          }
        }
      `;
      const data = await gql(query, { serviceId: params.serviceId });
      return data.serviceInstanceRedeploy;
    }

    case "listDeployments": {
      const query = `
        query($serviceId: String!) {
          service(id: $serviceId) {
            deployments(first: 20) {
              edges {
                node {
                  id
                  status
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { serviceId: params.serviceId });
      return data.service.deployments.edges.map((e: any) => e.node);
    }

    case "getDeployment": {
      const query = `
        query($id: String!) {
          deployment(id: $id) {
            id
            status
            createdAt
            updatedAt
            meta
          }
        }
      `;
      const data = await gql(query, { id: params.deploymentId });
      return data.deployment;
    }

    case "rollbackDeployment": {
      const query = `
        mutation($deploymentId: String!) {
          deploymentRollback(id: $deploymentId) {
            id
          }
        }
      `;
      const data = await gql(query, { deploymentId: params.deploymentId });
      return data.deploymentRollback;
    }

    // ==================== ENVIRONMENT VARIABLES ====================
    case "listVariables": {
      const query = `
        query($serviceId: String!, $environmentId: String!) {
          variables(serviceId: $serviceId, environmentId: $environmentId) {
            edges {
              node {
                id
                name
                createdAt
              }
            }
          }
        }
      `;
      const data = await gql(query, {
        serviceId: params.serviceId,
        environmentId: params.environmentId,
      });
      return data.variables.edges.map((e: any) => e.node);
    }

    case "setVariable": {
      const query = `
        mutation($input: VariableUpsertInput!) {
          variableUpsert(input: $input) {
            id
            name
          }
        }
      `;
      const data = await gql(query, {
        input: {
          serviceId: params.serviceId,
          environmentId: params.environmentId,
          name: params.name,
          value: params.value,
        },
      });
      return data.variableUpsert;
    }

    case "deleteVariable": {
      const query = `
        mutation($id: String!) {
          variableDelete(id: $id)
        }
      `;
      const data = await gql(query, { id: params.variableId });
      return { success: data.variableDelete, variableId: params.variableId };
    }

    // ==================== VOLUMES ====================
    case "listVolumes": {
      const query = `
        query($serviceId: String!) {
          service(id: $serviceId) {
            volumes {
              edges {
                node {
                  id
                  name
                  mountPath
                  createdAt
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { serviceId: params.serviceId });
      return data.service.volumes.edges.map((e: any) => e.node);
    }

    case "createVolume": {
      const query = `
        mutation($input: VolumeCreateInput!) {
          volumeCreate(input: $input) {
            id
            name
            mountPath
          }
        }
      `;
      const data = await gql(query, {
        input: {
          serviceId: params.serviceId,
          name: params.name,
          mountPath: params.mountPath,
        },
      });
      return data.volumeCreate;
    }

    case "deleteVolume": {
      const query = `
        mutation($id: String!) {
          volumeDelete(id: $id)
        }
      `;
      const data = await gql(query, { id: params.volumeId });
      return { success: data.volumeDelete, volumeId: params.volumeId };
    }

    // ==================== DOMAINS ====================
    case "listDomains": {
      const query = `
        query($serviceId: String!) {
          service(id: $serviceId) {
            domains {
              edges {
                node {
                  id
                  domain
                  createdAt
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { serviceId: params.serviceId });
      return data.service.domains.edges.map((e: any) => e.node);
    }

    case "createDomain": {
      const query = `
        mutation($input: CustomDomainCreateInput!) {
          customDomainCreate(input: $input) {
            id
            domain
          }
        }
      `;
      const data = await gql(query, {
        input: {
          serviceId: params.serviceId,
          domain: params.domain,
        },
      });
      return data.customDomainCreate;
    }

    case "deleteDomain": {
      const query = `
        mutation($id: String!) {
          customDomainDelete(id: $id)
        }
      `;
      const data = await gql(query, { id: params.domainId });
      return { success: data.customDomainDelete, domainId: params.domainId };
    }

    // ==================== LOGS & METRICS ====================
    case "getLogs": {
      const query = `
        query($deploymentId: String!, $limit: Int) {
          deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
            logs
          }
        }
      `;
      const data = await gql(query, {
        deploymentId: params.deploymentId,
        limit: params.limit || 100,
      });
      return data.deploymentLogs;
    }

    case "getMetrics": {
      const query = `
        query($serviceId: String!, $measurementName: String!) {
          serviceMetrics(
            serviceId: $serviceId
            measurementName: $measurementName
          ) {
            measurements {
              timestamp
              value
            }
          }
        }
      `;
      const data = await gql(query, {
        serviceId: params.serviceId,
        measurementName: params.measurementName || "CPU_PERC",
      });
      return data.serviceMetrics;
    }

    // ==================== ENVIRONMENTS ====================
    case "listEnvironments": {
      const query = `
        query($projectId: String!) {
          project(id: $projectId) {
            environments {
              edges {
                node {
                  id
                  name
                  createdAt
                }
              }
            }
          }
        }
      `;
      const data = await gql(query, { projectId: params.projectId });
      return data.project.environments.edges.map((e: any) => e.node);
    }

    case "createEnvironment": {
      const query = `
        mutation($input: EnvironmentCreateInput!) {
          environmentCreate(input: $input) {
            id
            name
          }
        }
      `;
      const data = await gql(query, {
        input: {
          projectId: params.projectId,
          name: params.name,
        },
      });
      return data.environmentCreate;
    }

    default:
      throw new Error(`Unknown Railway tool: ${tool}`);
  }
}
