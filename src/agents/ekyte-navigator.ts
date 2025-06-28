/**
 * EkyteNavigatorAgent - Agente Autônomo para Navegação e Aprendizado no Sistema Ekyte
 * 
 * Adaptado do claude-flow-bianca para usar as 22 ferramentas Puppeteer do user-tools-gemini
 * Inclui sistema de skills, sessões, aprendizado evolutivo e autonomia progressiva
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { SkillSystem } from './skill-system.js';
import {
  EkyteNavigatorConfig,
  EkyteSession,
  LearningMetrics,
  EkyteSkill,
  DEFAULT_SESSION_TIMEOUT,
  MAX_SCREENSHOTS_PER_SESSION
} from './types.js';
import {
  handleNavigate,
  handleScreenshot
} from '../tools/puppeteer/index.js';

export class EkyteNavigatorAgent extends EventEmitter {
  private config: EkyteNavigatorConfig;
  private skillSystem: SkillSystem;
  private currentSession: EkyteSession | null = null;
  private sessionsFile: string;
  private autonomyLevel: number = 0;
  private isRunning: boolean = false;

  constructor(config: EkyteNavigatorConfig) {
    super();
    
    const defaults = {
      name: 'EkyteNavigatorAgent',
      description: 'Agente autônomo para navegação e aprendizado no sistema Ekyte',
      dataDir: './data',
      screenshotsDir: './screenshots',
      enableLogging: true,
      autoSave: true,
      sessionTimeout: DEFAULT_SESSION_TIMEOUT,
      learningMode: 'active' as const,
      maxConcurrentTabs: 5,
      screenshotQuality: 80,
      autoExplore: true,
      skillSaveInterval: 30000
    };
    
    this.config = { ...defaults, ...config };

    this.skillSystem = new SkillSystem(this.config.dataDir, this.config.screenshotsDir);
    this.sessionsFile = path.join(this.config.dataDir!, 'sessions.json');
    
    this.setupEventHandlers();
  }

  // ================== INICIALIZAÇÃO ==================

  async initialize(): Promise<void> {
    console.log(`🚀 Inicializando ${this.config.name}...`);
    
    try {
      await this.ensureDirectories();
      await this.skillSystem.initialize();
      await this.loadSessions();
      
      // Configurar auto-save
      if (this.config.autoSave) {
        setInterval(() => this.autoSave(), this.config.skillSaveInterval!);
      }
      
      console.log(`✅ ${this.config.name} inicializado com sucesso!`);
      console.log(`📊 Status inicial:`);
      console.log(`   - Autonomia: ${this.autonomyLevel}%`);
      console.log(`   - Skills: ${this.skillSystem.listSkills().length} disponíveis`);
      console.log(`   - Modo: ${this.config.learningMode}`);
      
      this.emit('initialized', { agent: this.config.name, autonomyLevel: this.autonomyLevel });
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      throw error;
    }
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.config.dataDir!, { recursive: true });
    await fs.mkdir(this.config.screenshotsDir!, { recursive: true });
  }

  private setupEventHandlers(): void {
    this.on('skillLearned', (skill: EkyteSkill) => {
      console.log(`🎉 Nova skill aprendida: ${skill.name} (${skill.category})`);
      this.updateAutonomyLevel();
    });

    this.on('sessionCompleted', (session: EkyteSession) => {
      console.log(`📝 Sessão concluída: ${session.skillsLearned.length} skills aprendidas`);
    });

    this.on('autonomyLevelUp', (newLevel: number) => {
      console.log(`📈 Nível de autonomia aumentou para ${newLevel}%`);
    });

    this.on('error', (error: Error) => {
      console.error('🚨 Erro no agente:', error);
    });
  }

  // ================== GERENCIAMENTO DE SESSÕES ==================

  async startSession(initialUrl?: string): Promise<EkyteSession> {
    if (this.currentSession) {
      await this.endSession();
    }

    const session: EkyteSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      url: initialUrl || this.config.ekyteUrl || 'about:blank',
      skillsAttempted: [],
      skillsLearned: [],
      skillsImproved: [],
      screenshots: [],
      observations: [],
      dataExtracted: {},
      errors: [],
      nextSteps: [],
      autonomyLevel: this.autonomyLevel,
      successRate: 0
    };

    this.currentSession = session;
    
    console.log(`🔄 Nova sessão iniciada: ${session.id}`);
    
    if (initialUrl) {
      try {
        await handleNavigate({ url: initialUrl });
        this.currentSession.observations.push(`Navegou para: ${initialUrl}`);
      } catch (error) {
        console.error(`❌ Erro ao navegar para ${initialUrl}:`, error);
        this.currentSession.errors.push(`Navegação falhou: ${error}`);
      }
    }
    
    this.emit('sessionStarted', session);
    return session;
  }

  async endSession(): Promise<EkyteSession | null> {
    if (!this.currentSession) {
      return null;
    }

    this.currentSession.endTime = new Date();
    
    // Calcular taxa de sucesso
    const successfulSkills = this.currentSession.skillsLearned.length + this.currentSession.skillsImproved.length;
    this.currentSession.successRate = this.currentSession.skillsAttempted.length > 0 
      ? successfulSkills / this.currentSession.skillsAttempted.length 
      : 0;

    // Capturar screenshot final
    await this.takeSessionScreenshot('session-end');
    
    await this.saveSessions();
    
    const completedSession = this.currentSession;
    this.currentSession = null;
    
    this.emit('sessionCompleted', completedSession);
    return completedSession;
  }

  private async loadSessions(): Promise<void> {
    try {
      await fs.readFile(this.sessionsFile, 'utf-8');
      console.log('📂 Histórico de sessões carregado');
    } catch (error) {
      console.log('📝 Arquivo de sessões não encontrado, criando novo...');
    }
  }

  private async saveSessions(): Promise<void> {
    if (!this.currentSession) return;
    
    try {
      let sessions: EkyteSession[] = [];
      
      try {
        const data = await fs.readFile(this.sessionsFile, 'utf-8');
        sessions = JSON.parse(data);
      } catch {
        // Arquivo não existe ou está corrompido
      }
      
      sessions.push(this.serializeSession(this.currentSession));
      
      // Manter apenas as últimas 50 sessões
      sessions = sessions.slice(-50);
      
      await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar sessões:', error);
    }
  }

  private serializeSession(session: EkyteSession): any {
    return {
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString()
    };
  }

  // ================== UTILITÁRIOS ==================

  private async takeSessionScreenshot(suffix: string): Promise<string | null> {
    if (!this.currentSession) return null;
    
    try {
      const filename = `${this.currentSession.id}-${suffix}.png`;
      const fullPath = path.join(this.config.screenshotsDir!, filename);
      
      await handleScreenshot({ path: fullPath });
      
      this.currentSession.screenshots.push(fullPath);
      
      // Limitar screenshots por sessão
      if (this.currentSession.screenshots.length > MAX_SCREENSHOTS_PER_SESSION) {
        this.currentSession.screenshots = this.currentSession.screenshots.slice(-MAX_SCREENSHOTS_PER_SESSION);
      }
      
      return fullPath;
    } catch (error) {
      console.warn('⚠️  Erro ao capturar screenshot:', error);
      return null;
    }
  }

  private updateAutonomyLevel(): void {
    const metrics = this.skillSystem.getLearningMetrics();
    const newLevel = Math.min(100, Math.round(
      (metrics.learnedSkills / Math.max(metrics.totalSkills, 1)) * 100
    ));
    
    if (newLevel > this.autonomyLevel) {
      const oldLevel = this.autonomyLevel;
      this.autonomyLevel = newLevel;
      this.emit('autonomyLevelUp', newLevel);
      
      console.log(`📈 Autonomia: ${oldLevel}% → ${newLevel}%`);
    }
  }

  private async autoSave(): Promise<void> {
    try {
      await this.skillSystem.saveSkills();
      if (this.currentSession) {
        await this.saveSessions();
      }
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
    }
  }

  // ================== GETTERS E STATUS ==================

  getStatus() {
    const metrics = this.skillSystem.getLearningMetrics();
    
    return {
      agent: this.config.name,
      isRunning: this.isRunning,
      autonomyLevel: this.autonomyLevel,
      currentSession: this.currentSession?.id || null,
      skills: {
        total: metrics.totalSkills,
        learned: metrics.learnedSkills,
        successRate: metrics.successRate
      },
      config: {
        learningMode: this.config.learningMode,
        autoExplore: this.config.autoExplore,
        maxTabs: this.config.maxConcurrentTabs
      }
    };
  }

  getCurrentSession(): EkyteSession | null {
    return this.currentSession;
  }

  getSkillSystem(): SkillSystem {
    return this.skillSystem;
  }

  getLearningMetrics(): LearningMetrics {
    return this.skillSystem.getLearningMetrics();
  }

  async stop(): Promise<void> {
    console.log('🛑 Parando agente...');
    this.isRunning = false;
    
    if (this.currentSession) {
      await this.endSession();
    }
    
    await this.autoSave();
    console.log('✅ Agente parado com sucesso');
  }
} 