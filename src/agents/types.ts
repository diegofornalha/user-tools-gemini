/**
 * Tipos para o Sistema de Agentes do User-Tools-Gemini
 * Adaptado do claude-flow-bianca para usar as 22 ferramentas Puppeteer
 */

import { z } from 'zod';

// ================== CONFIGURAÇÃO DE AGENTES ==================

export interface AgentConfig {
  name: string;
  description: string;
  dataDir?: string;
  screenshotsDir?: string;
  enableLogging?: boolean;
  autoSave?: boolean;
  sessionTimeout?: number;
}

// ================== SISTEMA DE SKILLS ==================

export const SkillDifficultySchema = z.enum(['básico', 'intermediário', 'avançado']);
export type SkillDifficulty = z.infer<typeof SkillDifficultySchema>;

export const SkillCategorySchema = z.enum(['navegação', 'tarefas', 'filtros', 'dados', 'interface', 'automação']);
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export interface EkyteSkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  difficulty: SkillDifficulty;
  learned: boolean;
  attempts: number;
  successCount: number;
  lastAttempt: Date;
  lastSuccess?: Date;
  evidence: string[]; // Screenshots, logs, dados capturados
  selectors: string[]; // Seletores CSS aprendidos
  actions: SkillAction[]; // Sequência de ações
  confidence: number; // 0-1
  metadata: Record<string, any>;
}

export interface SkillAction {
  type: 'navigate' | 'click' | 'type' | 'fill' | 'select' | 'hover' | 'wait' | 'extract' | 'screenshot';
  selector?: string;
  text?: string;
  url?: string;
  timeout?: number;
  extractField?: string;
  filename?: string;
  description: string;
  optional?: boolean;
}

// ================== SESSÕES E PROGRESSO ==================

export interface EkyteSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  url: string;
  pageTitle?: string;
  skillsAttempted: string[];
  skillsLearned: string[];
  skillsImproved: string[];
  screenshots: string[];
  observations: string[];
  dataExtracted: Record<string, any>;
  errors: string[];
  nextSteps: string[];
  autonomyLevel: number; // 0-100
  successRate: number; // 0-1
}

// ================== NAVEGAÇÃO E CONTEXTO ==================

export interface NavigationContext {
  currentUrl: string;
  pageTitle?: string;
  pageType?: 'login' | 'dashboard' | 'tasks' | 'form' | 'list' | 'detail' | 'unknown';
  elementsDetected: DetectedElement[];
  possibleActions: string[];
  suggestions: string[];
  risks: string[];
}

export interface DetectedElement {
  type: 'button' | 'input' | 'select' | 'link' | 'table' | 'form' | 'menu';
  selector: string;
  text: string;
  attributes: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  interactive: boolean;
  confidence: number;
}

// ================== RESULTADOS E ANÁLISE ==================

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  skillsUsed: string[];
  screenshotsTaken: string[];
  dataExtracted: Record<string, any>;
  observations: string[];
  autonomyLevel: number;
}

export interface SkillExecutionResult {
  skill: EkyteSkill;
  success: boolean;
  timeElapsed: number;
  actions: Array<{
    action: SkillAction;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  dataExtracted: Record<string, any>;
  screenshot?: string;
  observations: string[];
  confidence: number;
  improvements?: string[];
}

// ================== APRENDIZADO E EVOLUÇÃO ==================

export interface LearningMetrics {
  totalSkills: number;
  learnedSkills: number;
  averageConfidence: number;
  totalAttempts: number;
  successRate: number;
  skillsByCategory: Record<SkillCategory, number>;
  skillsByDifficulty: Record<SkillDifficulty, number>;
  recentImprovements: Array<{
    skillId: string;
    improvement: string;
    timestamp: Date;
  }>;
}

export interface AutonomyProgress {
  currentLevel: number; // 0-100
  targetLevel: number;
  skillsToLearn: string[];
  nextMilestones: string[];
  learningVelocity: number; // skills/hour
  adaptationRate: number; // 0-1
  confidence: number; // 0-1
}

// ================== CONFIGURAÇÕES ESPECÍFICAS ==================

export interface EkyteNavigatorConfig extends AgentConfig {
  ekyteUrl?: string;
  credentials?: {
    email?: string;
    password?: string;
  };
  learningMode?: 'passive' | 'active' | 'aggressive';
  maxConcurrentTabs?: number;
  screenshotQuality?: number;
  autoExplore?: boolean;
  skillSaveInterval?: number;
}

// ================== VALIDAÇÃO E SCHEMAS ==================

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  category: SkillCategorySchema,
  difficulty: SkillDifficultySchema,
  learned: z.boolean(),
  attempts: z.number().min(0),
  successCount: z.number().min(0),
  lastAttempt: z.date(),
  lastSuccess: z.date().optional(),
  evidence: z.array(z.string()),
  selectors: z.array(z.string()),
  actions: z.array(z.object({
    type: z.enum(['navigate', 'click', 'type', 'fill', 'select', 'hover', 'wait', 'extract', 'screenshot']),
    selector: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
    timeout: z.number().optional(),
    extractField: z.string().optional(),
    filename: z.string().optional(),
    description: z.string(),
    optional: z.boolean().optional()
  })),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.any())
});

export const SessionSchema = z.object({
  id: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  url: z.string().url(),
  pageTitle: z.string().optional(),
  skillsAttempted: z.array(z.string()),
  skillsLearned: z.array(z.string()),
  skillsImproved: z.array(z.string()),
  screenshots: z.array(z.string()),
  observations: z.array(z.string()),
  dataExtracted: z.record(z.any()),
  errors: z.array(z.string()),
  nextSteps: z.array(z.string()),
  autonomyLevel: z.number().min(0).max(100),
  successRate: z.number().min(0).max(1)
});

// ================== UTILITÁRIOS DE TIPO ==================

export type PartialSkill = Partial<EkyteSkill> & Pick<EkyteSkill, 'name' | 'description' | 'category'>;

export type SkillUpdate = Partial<Pick<EkyteSkill, 'learned' | 'confidence' | 'evidence' | 'metadata'>>;

export type SessionUpdate = Partial<Pick<EkyteSession, 'observations' | 'dataExtracted' | 'errors' | 'nextSteps'>>;

// ================== CONSTANTES ==================

export const DEFAULT_SKILL_TIMEOUT = 30000; // 30 segundos
export const DEFAULT_SESSION_TIMEOUT = 300000; // 5 minutos
export const MAX_SCREENSHOTS_PER_SESSION = 50;
export const MAX_OBSERVATIONS_PER_SESSION = 100;

export const SKILL_DIFFICULTY_WEIGHTS: Record<SkillDifficulty, number> = {
  'básico': 1,
  'intermediário': 2,
  'avançado': 3
};

export const CATEGORY_PRIORITIES: Record<SkillCategory, number> = {
  'navegação': 10,
  'interface': 8,
  'tarefas': 6,
  'dados': 4,
  'filtros': 3,
  'automação': 2
}; 