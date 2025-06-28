

import { A2AClient } from './client.js';

async function runExample() {
  const client = new A2AClient('http://localhost:8080');

  try {
    console.log('--- Criando agente via A2A ---');
    const createResult = await client.createAgent('a2a-agent');
    console.log('Resultado da criação:', JSON.stringify(createResult, null, 2));

    console.log('\n--- Listando agentes via A2A ---');
    const listResult = await client.listAgents();
    console.log('Resultado da listagem:', JSON.stringify(listResult, null, 2));

  } catch (error) {
    console.error('Erro no exemplo do cliente A2A:', error);
  }
}

runExample();

