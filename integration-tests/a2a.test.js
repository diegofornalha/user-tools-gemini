import { EkyteNavigatorAgent } from '../src/agents/ekyte-navigator.js';
import { a2aHandlers } from '../src/tools/a2a/index.js';
import assert from 'assert';

describe('A2A Integration', () => {
    let agent;

    before(async () => {
        agent = new EkyteNavigatorAgent({});
        await agent.initialize();
    });

    it('should discover other agents', async () => {
        const result = await a2aHandlers.a2a_discover_agents({ query: 'data' });
        assert(result.success);
        assert(result.agents.length > 0);
    });

    it('should delegate a task to another agent', async () => {
        const result = await a2aHandlers.a2a_delegate_task({ agentId: 'agent-1', skillName: 'analyze_csv', params: { file: 'data.csv' } });
        assert(result.success);
        assert(result.result.message.includes('delegated successfully'));
    });

    it('should list local skills', async () => {
        const result = await a2aHandlers.a2a_list_local_skills();
        assert(result.success);
        assert(result.skills.length > 0);
    });
});
