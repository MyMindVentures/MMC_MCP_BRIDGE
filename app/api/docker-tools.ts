// Docker Tool Implementations - Full Docker API Support
// Container, image, network, and volume management via Docker API

import axios from 'axios';

const DOCKER_API = process.env.DOCKER_HOST || 'http://localhost:2375';
const DOCKER_SOCKET = process.env.DOCKER_SOCKET || '/var/run/docker.sock';

// Helper for Docker API calls
async function dockerRequest(method: string, path: string, data?: any) {
  const baseURL = process.env.DOCKER_HOST || DOCKER_API;
  
  // Note: Unix socket support requires additional setup
  // For now, use HTTP API: DOCKER_HOST=http://localhost:2375
  if (baseURL.includes('unix://')) {
    throw new Error('Unix socket Docker connection requires additional setup. Use DOCKER_HOST=http://localhost:2375 for TCP.');
  }
  
  try {
    const response = await axios({
      method,
      url: `${baseURL}${path}`,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Docker API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// ========== CONTAINERS ==========

export async function listContainers(all: boolean = false): Promise<any> {
  return await dockerRequest('GET', `/containers/json?all=${all ? 1 : 0}`);
}

export async function getContainer(id: string): Promise<any> {
  return await dockerRequest('GET', `/containers/${id}/json`);
}

export async function createContainer(config: any): Promise<any> {
  return await dockerRequest('POST', '/containers/create', config);
}

export async function startContainer(id: string): Promise<any> {
  return await dockerRequest('POST', `/containers/${id}/start`);
}

export async function stopContainer(id: string, timeout?: number): Promise<any> {
  return await dockerRequest('POST', `/containers/${id}/stop?t=${timeout || 10}`);
}

export async function restartContainer(id: string, timeout?: number): Promise<any> {
  return await dockerRequest('POST', `/containers/${id}/restart?t=${timeout || 10}`);
}

export async function removeContainer(id: string, force: boolean = false): Promise<any> {
  return await dockerRequest('DELETE', `/containers/${id}?force=${force ? 1 : 0}`);
}

export async function getContainerLogs(id: string, tail: number = 100): Promise<string> {
  const logs = await dockerRequest('GET', `/containers/${id}/logs?stdout=1&stderr=1&tail=${tail}`);
  return logs;
}

export async function execContainer(id: string, command: string[]): Promise<any> {
  // Create exec instance
  const exec = await dockerRequest('POST', `/containers/${id}/exec`, {
    AttachStdout: true,
    AttachStderr: true,
    Cmd: command
  });
  
  // Start exec
  return await dockerRequest('POST', `/exec/${exec.Id}/start`, {
    Detach: false,
    Tty: false
  });
}

// ========== IMAGES ==========

export async function listImages(all: boolean = false): Promise<any> {
  return await dockerRequest('GET', `/images/json?all=${all ? 1 : 0}`);
}

export async function getImage(name: string): Promise<any> {
  return await dockerRequest('GET', `/images/${name}/json`);
}

export async function pullImage(name: string): Promise<any> {
  return await dockerRequest('POST', `/images/create?fromImage=${name}`);
}

export async function buildImage(tarContext: Buffer, tag: string): Promise<any> {
  return await dockerRequest('POST', `/build?t=${tag}`, tarContext);
}

export async function removeImage(name: string, force: boolean = false): Promise<any> {
  return await dockerRequest('DELETE', `/images/${name}?force=${force ? 1 : 0}`);
}

// ========== NETWORKS ==========

export async function listNetworks(): Promise<any> {
  return await dockerRequest('GET', '/networks');
}

export async function getNetwork(id: string): Promise<any> {
  return await dockerRequest('GET', `/networks/${id}`);
}

export async function createNetwork(config: any): Promise<any> {
  return await dockerRequest('POST', '/networks/create', config);
}

export async function removeNetwork(id: string): Promise<any> {
  return await dockerRequest('DELETE', `/networks/${id}`);
}

// ========== VOLUMES ==========

export async function listVolumes(): Promise<any> {
  return await dockerRequest('GET', '/volumes');
}

export async function getVolume(name: string): Promise<any> {
  return await dockerRequest('GET', `/volumes/${name}`);
}

export async function createVolume(config: any): Promise<any> {
  return await dockerRequest('POST', '/volumes/create', config);
}

export async function removeVolume(name: string): Promise<any> {
  return await dockerRequest('DELETE', `/volumes/${name}`);
}

// ========== SYSTEM ==========

export async function getSystemInfo(): Promise<any> {
  return await dockerRequest('GET', '/info');
}

export async function getSystemVersion(): Promise<any> {
  return await dockerRequest('GET', '/version');
}

// MAIN EXECUTOR
export async function executeDockerTool(tool: string, params: any): Promise<any> {
  try {
    switch (tool) {
      // Containers
      case 'listContainers':
        return await listContainers(params.all);
      case 'getContainer':
        return await getContainer(params.id);
      case 'createContainer':
        return await createContainer(params.config);
      case 'startContainer':
        return await startContainer(params.id);
      case 'stopContainer':
        return await stopContainer(params.id, params.timeout);
      case 'restartContainer':
        return await restartContainer(params.id, params.timeout);
      case 'removeContainer':
        return await removeContainer(params.id, params.force);
      case 'getContainerLogs':
        return await getContainerLogs(params.id, params.tail);
      case 'execContainer':
        return await execContainer(params.id, params.command);
      
      // Images
      case 'listImages':
        return await listImages(params.all);
      case 'getImage':
        return await getImage(params.name);
      case 'pullImage':
        return await pullImage(params.name);
      case 'buildImage':
        return await buildImage(params.tarContext, params.tag);
      case 'removeImage':
        return await removeImage(params.name, params.force);
      
      // Networks
      case 'listNetworks':
        return await listNetworks();
      case 'getNetwork':
        return await getNetwork(params.id);
      case 'createNetwork':
        return await createNetwork(params.config);
      case 'removeNetwork':
        return await removeNetwork(params.id);
      
      // Volumes
      case 'listVolumes':
        return await listVolumes();
      case 'getVolume':
        return await getVolume(params.name);
      case 'createVolume':
        return await createVolume(params.config);
      case 'removeVolume':
        return await removeVolume(params.name);
      
      // System
      case 'getSystemInfo':
        return await getSystemInfo();
      case 'getSystemVersion':
        return await getSystemVersion();
      
      default:
        throw new Error(`Unknown Docker tool: ${tool}`);
    }
  } catch (error: any) {
    throw error;
  }
}

