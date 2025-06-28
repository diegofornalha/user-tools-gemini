/**
 * Ferramentas MCP para Sistema de Agentes - Versão Concisa
 */

import { z } from 'zod';
import {
  createEkyteAgent,
  createEkyteAgentWithPreset,
} from '../../agents/index.js';
import type { EkyteNavigatorAgent } from '../../agents/ekyte-navigator.js';

// Estado global dos agentes
const activeAgents = new Map<string, EkyteNavigatorAgent>();

// Schemas
const CreateAgentSchema = z.object({
  agentId: z.string().min(1),
  preset: z.enum(['development', 'production', 'testing']).optional(),
});

const AgentActionSchema = z.object({
  agentId: z.string().min(1),
});

const ExecuteSkillSchema = z.object({
  agentId: z.string().min(1),
  skillName: z.string().min(1),
});

// Handlers
export async function handleCreateAgent(params: {
  agentId: string;
  preset?: string;
}) {
  const validated = CreateAgentSchema.parse(params);

  if (activeAgents.has(validated.agentId)) {
    throw new Error(`Agente ${validated.agentId} já existe`);
  }

  let agent;
  if (validated.preset) {
    agent = await createEkyteAgentWithPreset(validated.preset);
  } else {
    agent = await createEkyteAgent({});
  }
  activeAgents.set(validated.agentId, agent);

  return {
    success: true,
    agentId: validated.agentId,
    status: agent.getStatus(),
    activeAgents: Array.from(activeAgents.keys()), // Retorna apenas os IDs dos agentes
  };
}

export async function handleListAgents() {
  const agents = Array.from(activeAgents.entries()).map(([id, agent]) => ({
    id,
    status: agent.getStatus(),
  }));

  return {
    agents,
    count: agents.length,
    activeAgents: Array.from(activeAgents.keys()),
  };
}

export async function handleExecuteSkill(params: {
  agentId: string;
  skillName: string;
}) {
  const validated = ExecuteSkillSchema.parse(params);

  const agent = activeAgents.get(validated.agentId);
  if (!agent) {
    throw new Error(`Agente ${validated.agentId} não encontrado`);
  }

  const skillSystem = agent.getSkillSystem();
  const skill = skillSystem.getSkillByName(validated.skillName);

  if (!skill) {
    const availableSkills = skillSystem.listSkills().map((s) => s.name);
    throw new Error(
      `Skill "${validated.skillName}" não encontrada. Disponíveis: ${availableSkills.join(', ')}`,
    );
  }

  const result = await skillSystem.executeSkill(skill.id);

  return {
    agentId: validated.agentId,
    skillName: validated.skillName,
    success: result.success,
    confidence: result.confidence,
    observations: result.observations,
  };
}

export async function handleListSkills(params: { agentId: string }) {
  const validated = AgentActionSchema.parse(params);

  const agent = activeAgents.get(validated.agentId);
  if (!agent) {
    throw new Error(`Agente ${validated.agentId} não encontrado`);
  }

  const skillSystem = agent.getSkillSystem();
  const skills = skillSystem.listSkills();

  return {
    agentId: validated.agentId,
    skills: skills.map((skill) => ({
      name: skill.name,
      category: skill.category,
      learned: skill.learned,
      confidence: skill.confidence,
    })),
  };
}

// Exportações
export const agentsHandlers = {
  agents_create: handleCreateAgent,
  agents_list: handleListAgents,
  agents_execute_skill: handleExecuteSkill,
  agents_list_skills: handleListSkills,
};

export const agentsTools = [
  {
    name: 'agents_create',
    description: 'Criar um novo agente EkyteNavigator',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'ID único para o agente' },
      },
      required: ['agentId'],
    },
  },
  {
    name: 'agents_list',
    description: 'Listar agentes ativos',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'agents_execute_skill',
    description: 'Executar uma skill específica',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'ID do agente' },
        skillName: { type: 'string', description: 'Nome da skill' },
      },
      required: ['agentId', 'skillName'],
    },
  },
  {
    name: 'agents_list_skills',
    description: 'Listar skills disponíveis',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'ID do agente' },
      },
      required: ['agentId'],
    },
  },
];
