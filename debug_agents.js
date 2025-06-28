

import { agentsHandlers } from './build/tools/agents/index.js';
import { A2AClient } from '@a2a-js/sdk';

// --- Helper function to connect an agent to the A2A Host ---
async function connectAgentToHost(agentId) {
  try {
    const client = new A2AClient({ agentId });
    await client.connect();
    console.log(`✅ Agent '${agentId}' connected to A2A Host.`);
    return client;
  } catch (error) {
    console.error(`❌ Failed to connect agent '${agentId}' to A2A Host:`, error);
    return null;
  }
}

async function debugAgents() {
  try {
    // --- Create Agents ---
    console.log('--- Creating agents ---');
    const agent1 = await agentsHandlers.agents_create({ agentId: 'debug-agent' });
    const agent2 = await agentsHandlers.agents_create({ agentId: 'task-agent' });
    console.log('Agents created:', JSON.stringify([agent1, agent2], null, 2));

    // --- Connect Agents to A2A Host ---
    console.log('\n--- Connecting agents to A2A Host ---');
    const client1 = await connectAgentToHost('debug-agent');
    const client2 = await connectAgentToHost('task-agent');

    // --- Verify Connections ---
    if (client1 && client2) {
        console.log('\n--- Listing agents on the network ---');
        const networkAgents = await client1.listAgents();
        console.log('Network agents:', JSON.stringify(networkAgents, null, 2));
    } else {
        console.error('Could not connect all agents. Aborting verification.');
    }

  } catch (error) {
    console.error('Error during debugAgents:', error);
  }
}

debugAgents();

