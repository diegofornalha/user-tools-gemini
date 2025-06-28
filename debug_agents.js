

import { agentsHandlers } from './build/tools/agents/index.js';

async function debugAgents() {
  try {
    console.log('--- Attempting to create agent ---');
    const createResult = await agentsHandlers.agents_create({ agentId: 'debug-agent' });
    console.log('Create agent result:', JSON.stringify(createResult, null, 2));

    console.log('\n--- Attempting to list agents ---');
    const listResult = await agentsHandlers.agents_list();
    console.log('List agents result:', JSON.stringify(listResult, null, 2));

  } catch (error) {
    console.error('Error during debugAgents:', error);
  }
}

debugAgents();

