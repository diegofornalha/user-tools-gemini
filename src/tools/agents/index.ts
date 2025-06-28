/**
 * Ferramentas MCP para Sistema de Agentes - Versão Concisa
 */

import { z } from 'zod';
import {
  createEkyteAgent,
  createEkyteAgentWithPreset,
} from '../../agents/index.js';
import { EkyteNavigatorAgent } from '../../agents/ekyte-navigator.js';
import { promises as fs } from 'fs';
import path from 'path';

// Estado global dos agentes
const activeAgents = new Map<string, EkyteNavigatorAgent>();
const AGENTS_FILE = path.join(process.cwd(), 'data', 'active-agents.json');

// Helper functions for persistence
async function loadActiveAgents(): Promise<void> {
  try {
    const data = await fs.readFile(AGENTS_FILE, 'utf-8');
    const savedAgents: Array<{ id: string; config: any }> = JSON.parse(data);
    console.log('Loaded agents raw data:', savedAgents);
    activeAgents.clear();
    for (const { id, config } of savedAgents) {
      const agent = new EkyteNavigatorAgent(config);
      await agent.initialize();
      activeAgents.set(id, agent);
    }
    console.log(`Loaded ${activeAgents.size} agents from ${AGENTS_FILE}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('No active agents file found, starting fresh.');
    } else {
      console.error('Error loading active agents:', error);
    }
  }
}

async function saveActiveAgents(): Promise<void> {
  try {
    const agentsToSave = Array.from(activeAgents.entries()).map(([id, agent]) => ({
      id,
      config: agent['config'], // Access the private config property
    }));
    console.log('Saving agents:', agentsToSave);
    await fs.mkdir(path.dirname(AGENTS_FILE), { recursive: true });
    await fs.writeFile(AGENTS_FILE, JSON.stringify(agentsToSave, null, 2), 'utf-8');
    console.log(`Saved ${agentsToSave.length} agents to ${AGENTS_FILE}`);
  } catch (error) {
    console.error('Error saving active agents:', error);
  }
}

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

  await loadActiveAgents();

  if (activeAgents.has(validated.agentId)) {
    throw new Error(`Agente ${validated.agentId} já existe`);
  }

  let agent;
  if (validated.preset) {
    agent = await createEkyteAgentWithPreset(validated.preset);
  } else {
    agent = await createEkyteAgent({});
  }
  await agent.initialize();
  const skillCount = agent.getSkillSystem().listSkills().length;
  console.log(
    `Agente ${validated.agentId} inicializado com sucesso. Habilidades carregadas: ${skillCount}.`,
  );
  activeAgents.set(validated.agentId, agent);
  console.log('activeAgents after create:', Array.from(activeAgents.keys()));

  await saveActiveAgents();

  return {
    success: true,
    agentId: validated.agentId,
    status: {
      ...agent.getStatus(),
      skillsLoaded: agent.getSkillSystem().listSkills().length,
    },
    activeAgents: Array.from(activeAgents.keys()),
  };
}

export async function handleListAgents() {
  await loadActiveAgents();
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
  await loadActiveAgents();
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
  await loadActiveAgents();
  const validated = AgentActionSchema.parse(params);

  const agent = activeAgents.get(validated.agentId);
  if (!agent) {
    throw new Error(`Agente ${validated.agentId} não encontrado`);
  }

  const skillSystem = agent.getSkillSystem();
  const skills = skillSystem.listSkills();
  console.log('Skills from agent.getSkillSystem().listSkills():', skills);

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
