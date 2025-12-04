// Initialize Agentic Worker on app startup
// This file is imported by the app to start the worker

import { agentWorker } from './queue';

// Worker starts automatically when imported
export { agentWorker };

console.log('[MMC Bridge] Agentic Worker initialized');



