/**
 * Arquivo de Exportação dos Agentes do User-Tools-Gemini
 * 
 * Centraliza as exportações dos agentes e sistemas relacionados
 */

// Tipos e Interfaces
export * from './types.js';

// Sistema de Skills
export { SkillSystem } from './skill-system.js';

// Agente Principal
export { EkyteNavigatorAgent } from './ekyte-navigator.js';

// Factory para criar agentes configurados
export async function createEkyteAgent(config: Partial<import('./types.js').EkyteNavigatorConfig> = {}) {
  const { EkyteNavigatorAgent } = await import('./ekyte-navigator.js');
  
  const fullConfig: import('./types.js').EkyteNavigatorConfig = {
    name: 'EkyteNavigatorAgent',
    description: 'Agente autônomo para navegação e aprendizado no sistema Ekyte',
    ...config
  };
  
  const agent = new EkyteNavigatorAgent(fullConfig);
  await agent.initialize();
  
  return agent;
}

// Configurações pré-definidas
export const agentPresets = {
  development: {
    name: 'EkyteNavigator-Dev',
    learningMode: 'active' as const,
    autoExplore: true,
    enableLogging: true,
    screenshotQuality: 80,
    dataDir: './data/dev',
    screenshotsDir: './screenshots/dev'
  },
  
  production: {
    name: 'EkyteNavigator-Prod',
    learningMode: 'passive' as const,
    autoExplore: false,
    enableLogging: false,
    screenshotQuality: 60,
    dataDir: './data/prod',
    screenshotsDir: './screenshots/prod'
  },
  
  testing: {
    name: 'EkyteNavigator-Test',
    learningMode: 'aggressive' as const,
    autoExplore: true,
    enableLogging: true,
    screenshotQuality: 90,
    dataDir: './data/test',
    screenshotsDir: './screenshots/test',
    sessionTimeout: 60000 // 1 minuto para testes
  }
};

// Helper para criar agente com preset
export async function createEkyteAgentWithPreset(
  preset: keyof typeof agentPresets, 
  overrides: Partial<import('./types.js').EkyteNavigatorConfig> = {}
) {
  const config = { ...agentPresets[preset], ...overrides };
  return createEkyteAgent(config);
}

// Utilitários para análise de sessões
export class SessionAnalyzer {
  static analyzeSession(session: import('./types.js').EkyteSession) {
    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();
      
    return {
      id: session.id,
      duration: duration,
      durationFormatted: this.formatDuration(duration),
      skillsAttempted: session.skillsAttempted.length,
      skillsLearned: session.skillsLearned.length,
      skillsImproved: session.skillsImproved.length,
      successRate: session.successRate,
      screenshotsTaken: session.screenshots.length,
      observationsCount: session.observations.length,
      errorsCount: session.errors.length,
      autonomyLevel: session.autonomyLevel,
      productivity: session.skillsLearned.length / Math.max(session.skillsAttempted.length, 1),
      quality: 1 - (session.errors.length / Math.max(session.observations.length, 1))
    };
  }
  
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  static generateSessionSummary(sessions: import('./types.js').EkyteSession[]) {
    const analyses = sessions.map(s => this.analyzeSession(s));
    
    return {
      totalSessions: sessions.length,
      totalDuration: analyses.reduce((sum, a) => sum + a.duration, 0),
      averageSessionDuration: analyses.reduce((sum, a) => sum + a.duration, 0) / sessions.length,
      totalSkillsLearned: analyses.reduce((sum, a) => sum + a.skillsLearned, 0),
      averageSuccessRate: analyses.reduce((sum, a) => sum + a.successRate, 0) / sessions.length,
      averageAutonomyLevel: analyses.reduce((sum, a) => sum + a.autonomyLevel, 0) / sessions.length,
      totalScreenshots: analyses.reduce((sum, a) => sum + a.screenshotsTaken, 0),
      mostProductiveSession: analyses.reduce((max, a) => a.productivity > max.productivity ? a : max),
      bestQualitySession: analyses.reduce((max, a) => a.quality > max.quality ? a : max)
    };
  }
}

// Exportações de conveniência
export type {
  EkyteNavigatorConfig,
  EkyteSession,
  EkyteSkill,
  SkillExecutionResult,
  TaskResult,
  LearningMetrics,
  AutonomyProgress
} from './types.js'; 