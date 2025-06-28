/**
 * Sistema de Skills para EkyteNavigatorAgent
 * Gerencia aprendizado e execução de habilidades usando as 22 ferramentas Puppeteer
 */

import { 
  EkyteSkill, 
  SkillAction, 
  SkillExecutionResult, 
  SkillCategory, 
  SkillDifficulty,
  LearningMetrics,
  PartialSkill,
  SkillUpdate,
  DEFAULT_SKILL_TIMEOUT,
  SKILL_DIFFICULTY_WEIGHTS,
  CATEGORY_PRIORITIES,
  SkillSchema
} from './types.js';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  handleNavigate,
  handleScreenshot,
  handleClick,
  handleType,
  handleFill,
  handleSelect,
  handleHover,
  handleWaitForElement,
  handleGetText,
  handleGetTitle,
  handleGetUrl
} from '../tools/puppeteer/index.js';

export class SkillSystem {
  private skills: Map<string, EkyteSkill> = new Map();
  private skillsFile: string;
  private screenshotsDir: string;
  private confidence_threshold: number = 0.7;

  constructor(dataDir: string = './data', screenshotsDir: string = './screenshots') {
    this.skillsFile = path.join(dataDir, 'ekyte-skills.json');
    this.screenshotsDir = screenshotsDir;
    this.ensureDirectories();
  }

  // ================== INICIALIZAÇÃO ==================

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.skillsFile), { recursive: true });
      await fs.mkdir(this.screenshotsDir, { recursive: true });
    } catch (error) {
      console.warn('Aviso ao criar diretórios:', error);
    }
  }

  async initialize(): Promise<void> {
    await this.loadSkills();
    await this.initializeDefaultSkills();
  }

  // ================== PERSISTÊNCIA ==================

  async loadSkills(): Promise<void> {
    try {
      const data = await fs.readFile(this.skillsFile, 'utf-8');
      const skillsData = JSON.parse(data);
      
      this.skills.clear();
      for (const skillData of skillsData) {
        const skill = this.parseSkillFromStorage(skillData);
        this.skills.set(skill.id, skill);
      }
      
      console.log(`✅ Carregadas ${this.skills.size} skills do arquivo`);
    } catch (error) {
      console.log('📝 Arquivo de skills não encontrado, inicializando novo...');
      this.skills.clear();
    }
  }

  async saveSkills(): Promise<void> {
    try {
      const skillsData = Array.from(this.skills.values()).map(skill => 
        this.serializeSkillForStorage(skill)
      );
      
      await fs.writeFile(this.skillsFile, JSON.stringify(skillsData, null, 2));
      console.log(`💾 Skills salvas: ${skillsData.length} skills persistidas`);
    } catch (error) {
      console.error('❌ Erro ao salvar skills:', error);
    }
  }

  private parseSkillFromStorage(data: any): EkyteSkill {
    return {
      ...data,
      lastAttempt: new Date(data.lastAttempt),
      lastSuccess: data.lastSuccess ? new Date(data.lastSuccess) : undefined
    };
  }

  private serializeSkillForStorage(skill: EkyteSkill): any {
    return {
      ...skill,
      lastAttempt: skill.lastAttempt.toISOString(),
      lastSuccess: skill.lastSuccess?.toISOString()
    };
  }

  // ================== SKILLS PADRÃO ==================

  private async initializeDefaultSkills(): Promise<void> {
    const defaultSkills: PartialSkill[] = [
      // Navegação
      {
        name: 'Acessar Login Ekyte',
        description: 'Navegar até a página de login e verificar elementos',
        category: 'navegação',
        difficulty: 'básico',
        actions: [
          { type: 'navigate', url: '', description: 'Navegar para URL do Ekyte' },
          { type: 'screenshot', filename: 'login-page', description: 'Capturar tela do login' },
          { type: 'wait', selector: 'input[type="email"], input[name="email"]', timeout: 5000, description: 'Aguardar campo de email' }
        ]
      },
      {
        name: 'Realizar Login',
        description: 'Fazer login no sistema com credenciais',
        category: 'navegação',
        difficulty: 'intermediário',
        actions: [
          { type: 'fill', selector: 'input#email', description: 'Preencher email' },
          { type: 'fill', selector: 'input[type="password"], input[name="password"]', description: 'Preencher senha' },
          { type: 'click', selector: 'button[type="submit"], input[type="submit"], .login-btn', description: 'Clicar em entrar' },
          { type: 'wait', timeout: 3000, description: 'Aguardar redirecionamento' },
          { type: 'screenshot', filename: 'after-login', description: 'Capturar tela pós-login' }
        ]
      },

      // Interface
      {
        name: 'Explorar Dashboard',
        description: 'Identificar elementos principais do dashboard',
        category: 'interface',
        difficulty: 'básico',
        actions: [
          { type: 'extract', extractField: 'title', description: 'Obter título da página' },
          { type: 'extract', extractField: 'url', description: 'Obter URL atual' },
          { type: 'screenshot', filename: 'dashboard', description: 'Capturar dashboard' }
        ]
      },
      {
        name: 'Identificar Menu Principal',
        description: 'Localizar e mapear itens do menu de navegação',
        category: 'interface',
        difficulty: 'intermediário',
        actions: [
          { type: 'extract', selector: 'nav, .menu, .sidebar', extractField: 'text', description: 'Extrair texto do menu' },
          { type: 'hover', selector: 'nav a, .menu a', description: 'Hover sobre itens do menu' },
          { type: 'screenshot', filename: 'menu-hover', description: 'Capturar menu em hover' }
        ]
      },

      // Tarefas
      {
        name: 'Acessar Lista de Tarefas',
        description: 'Navegar para a seção de tarefas',
        category: 'tarefas',
        difficulty: 'básico',
        actions: [
          { type: 'click', selector: 'a[href*="task"], a[href*="tarefa"], .tasks-link', description: 'Clicar em link de tarefas' },
          { type: 'wait', timeout: 2000, description: 'Aguardar carregamento' },
          { type: 'screenshot', filename: 'tasks-list', description: 'Capturar lista de tarefas' }
        ]
      },
      {
        name: 'Criar Nova Tarefa',
        description: 'Processo completo de criação de tarefa',
        category: 'tarefas',
        difficulty: 'avançado',
        actions: [
          { type: 'click', selector: '.new-task, .add-task, button[title*="Nova"], button[title*="Criar"]', description: 'Clicar em nova tarefa' },
          { type: 'wait', selector: 'input[name*="title"], input[name*="nome"]', timeout: 3000, description: 'Aguardar formulário' },
          { type: 'fill', selector: 'input[name*="title"], input[name*="nome"]', text: 'Tarefa Teste', description: 'Preencher título' },
          { type: 'fill', selector: 'textarea[name*="description"], textarea[name*="desc"]', text: 'Descrição automática', description: 'Preencher descrição' },
          { type: 'screenshot', filename: 'new-task-form', description: 'Capturar formulário preenchido' }
        ]
      },

      // Dados
      {
        name: 'Extrair Dados da Tabela',
        description: 'Capturar informações tabulares',
        category: 'dados',
        difficulty: 'intermediário',
        actions: [
          { type: 'extract', selector: 'table', extractField: 'text', description: 'Extrair texto da tabela' },
          { type: 'extract', selector: 'table th', extractField: 'text', description: 'Extrair cabeçalhos' },
          { type: 'screenshot', filename: 'data-table', description: 'Capturar tabela' }
        ]
      },

      // Filtros
      {
        name: 'Aplicar Filtros',
        description: 'Usar sistema de filtros para refinar resultados',
        category: 'filtros',
        difficulty: 'intermediário',
        actions: [
          { type: 'click', selector: '.filter, .filtro, [data-filter]', description: 'Abrir filtros' },
          { type: 'select', selector: 'select[name*="status"]', text: 'Ativo', description: 'Selecionar status' },
          { type: 'click', selector: '.apply-filter, .aplicar', description: 'Aplicar filtros' },
          { type: 'wait', timeout: 2000, description: 'Aguardar resultados' },
          { type: 'screenshot', filename: 'filtered-results', description: 'Capturar resultados filtrados' }
        ]
      }
    ];

    for (const skillData of defaultSkills) {
      if (!this.hasSkill(skillData.name)) {
        await this.createSkill(skillData);
      }
    }
  }

  // ================== GERENCIAMENTO DE SKILLS ==================

  async createSkill(skillData: PartialSkill): Promise<EkyteSkill> {
    const skill: EkyteSkill = {
      id: this.generateSkillId(skillData.name),
      name: skillData.name,
      description: skillData.description,
      category: skillData.category,
      difficulty: skillData.difficulty || 'básico',
      learned: false,
      attempts: 0,
      successCount: 0,
      lastAttempt: new Date(),
      evidence: [],
      selectors: skillData.selectors || [],
      actions: skillData.actions || [],
      confidence: 0,
      metadata: skillData.metadata || {}
    };

    // Validação
    try {
      SkillSchema.parse(skill);
    } catch (error) {
      throw new Error(`Skill inválida: ${error}`);
    }

    this.skills.set(skill.id, skill);
    await this.saveSkills();
    
    console.log(`📚 Nova skill criada: ${skill.name} (${skill.category}/${skill.difficulty})`);
    return skill;
  }

  async updateSkill(skillId: string, updates: SkillUpdate): Promise<void> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill não encontrada: ${skillId}`);
    }

    Object.assign(skill, updates);
    skill.lastAttempt = new Date();
    
    this.skills.set(skillId, skill);
    await this.saveSkills();
  }

  getSkill(skillId: string): EkyteSkill | undefined {
    return this.skills.get(skillId);
  }

  getSkillByName(name: string): EkyteSkill | undefined {
    return Array.from(this.skills.values()).find(skill => skill.name === name);
  }

  hasSkill(name: string): boolean {
    return this.getSkillByName(name) !== undefined;
  }

  listSkills(category?: SkillCategory, difficulty?: SkillDifficulty): EkyteSkill[] {
    let skills = Array.from(this.skills.values());
    
    if (category) {
      skills = skills.filter(skill => skill.category === category);
    }
    
    if (difficulty) {
      skills = skills.filter(skill => skill.difficulty === difficulty);
    }
    
    return skills.sort((a, b) => CATEGORY_PRIORITIES[a.category] - CATEGORY_PRIORITIES[b.category]);
  }

  getLearnedSkills(): EkyteSkill[] {
    return Array.from(this.skills.values()).filter(skill => skill.learned);
  }

  getUnlearnedSkills(): EkyteSkill[] {
    return Array.from(this.skills.values())
      .filter(skill => !skill.learned)
      .sort((a, b) => SKILL_DIFFICULTY_WEIGHTS[a.difficulty] - SKILL_DIFFICULTY_WEIGHTS[b.difficulty]);
  }

  // ================== EXECUÇÃO DE SKILLS ==================

  async executeSkill(skillId: string, context?: any): Promise<SkillExecutionResult> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill não encontrada: ${skillId}`);
    }

    console.log(`🎯 Executando skill: ${skill.name}`);
    const startTime = Date.now();
    
    skill.attempts++;
    skill.lastAttempt = new Date();

    const result: SkillExecutionResult = {
      skill,
      success: false,
      timeElapsed: 0,
      actions: [],
      dataExtracted: {},
      observations: [],
      confidence: 0,
      improvements: []
    };

    try {
      // Capturar screenshot inicial
      const initialScreenshot = await this.takeScreenshot(`${skill.id}-start`);
      if (initialScreenshot) {
        result.observations.push(`Screenshot inicial: ${initialScreenshot}`);
      }

      // Executar cada ação da skill
      for (const action of skill.actions) {
        const actionResult = await this.executeAction(action, context);
        result.actions.push(actionResult);
        
        if (actionResult.result && typeof actionResult.result === 'object') {
          Object.assign(result.dataExtracted, actionResult.result);
        }
        
        if (!actionResult.success && !action.optional) {
          throw new Error(`Ação obrigatória falhou: ${action.description}`);
        }
      }

      // Screenshot final
      const finalScreenshot = await this.takeScreenshot(`${skill.id}-end`);
      if (finalScreenshot) {
        result.screenshot = finalScreenshot;
        result.observations.push(`Screenshot final: ${finalScreenshot}`);
      }

      result.success = true;
      result.confidence = this.calculateSkillConfidence(skill, result);
      
      // Atualizar skill com sucesso
      skill.successCount++;
      if (result.confidence >= this.confidence_threshold) {
        skill.learned = true;
        result.observations.push('🎉 Skill aprendida com sucesso!');
      }
      
      skill.confidence = Math.max(skill.confidence, result.confidence);
      skill.evidence.push(finalScreenshot || 'execution-success');

    } catch (error) {
      result.success = false;
      result.observations.push(`❌ Erro: ${error}`);
      console.error(`Erro na execução da skill ${skill.name}:`, error);
    }

    result.timeElapsed = Date.now() - startTime;
    
    // Salvar progresso
    await this.updateSkill(skillId, {
      learned: skill.learned,
      confidence: skill.confidence,
      evidence: skill.evidence
    });

    console.log(`⏱️  Skill executada em ${result.timeElapsed}ms - Sucesso: ${result.success}`);
    return result;
  }

  private async executeAction(action: SkillAction, context?: any): Promise<{
    action: SkillAction;
    success: boolean;
    result?: any;
    error?: string;
  }> {
    try {
      console.log(`  🔄 Executando: ${action.description}`);
      
      let result;
      switch (action.type) {
        case 'navigate':
          result = await handleNavigate({ url: action.url || context?.url || '' });
          break;
          
        case 'click':
          result = await handleClick({ selector: action.selector! });
          break;
          
        case 'type':
          result = await handleType({ selector: action.selector!, text: action.text || '' });
          break;
          
        case 'fill':
          result = await handleFill({ selector: action.selector!, value: action.text || '' });
          break;
          
        case 'select':
          result = await handleSelect({ selector: action.selector!, value: action.text || '' });
          break;
          
        case 'hover':
          result = await handleHover({ selector: action.selector! });
          break;
          
        case 'wait':
          if (action.selector) {
            result = await handleWaitForElement({ 
              selector: action.selector, 
              timeout: action.timeout || DEFAULT_SKILL_TIMEOUT 
            });
          } else {
            await new Promise(resolve => setTimeout(resolve, action.timeout || 1000));
            result = { success: true };
          }
          break;
          
        case 'extract':
          if (action.extractField === 'title') {
            result = await handleGetTitle();
          } else if (action.extractField === 'url') {
            result = await handleGetUrl();
          } else if (action.selector) {
            result = await handleGetText({ selector: action.selector });
          }
          break;
          
        case 'screenshot':
          const filename = action.filename || `skill-${Date.now()}`;
          result = await this.takeScreenshot(filename);
          break;
          
        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`);
      }

      return {
        action,
        success: true,
        result
      };
      
    } catch (error) {
      return {
        action,
        success: false,
        error: String(error)
      };
    }
  }

  // ================== AUXILIARES ==================

  private async takeScreenshot(filename: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.screenshotsDir, `${filename}.png`);
      await handleScreenshot({ path: fullPath });
      return fullPath;
    } catch (error) {
      console.warn('Erro ao capturar screenshot:', error);
      return null;
    }
  }

  private calculateSkillConfidence(skill: EkyteSkill, result: SkillExecutionResult): number {
    const successRate = skill.successCount / skill.attempts;
    const actionSuccessRate = result.actions.filter(a => a.success).length / result.actions.length;
    const timeBonus = result.timeElapsed < DEFAULT_SKILL_TIMEOUT ? 0.1 : 0;
    
    return Math.min(1, (successRate * 0.6) + (actionSuccessRate * 0.3) + timeBonus);
  }

  private generateSkillId(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ================== MÉTRICAS E ANÁLISE ==================

  getLearningMetrics(): LearningMetrics {
    const skills = Array.from(this.skills.values());
    const learnedSkills = skills.filter(s => s.learned);
    
    return {
      totalSkills: skills.length,
      learnedSkills: learnedSkills.length,
      averageConfidence: skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length || 0,
      totalAttempts: skills.reduce((sum, s) => sum + s.attempts, 0),
      successRate: skills.reduce((sum, s) => sum + (s.successCount / Math.max(s.attempts, 1)), 0) / skills.length || 0,
      skillsByCategory: this.groupSkillsByCategory(skills),
      skillsByDifficulty: this.groupSkillsByDifficulty(skills),
      recentImprovements: this.getRecentImprovements()
    };
  }

  private groupSkillsByCategory(skills: EkyteSkill[]): Record<SkillCategory, number> {
    const result = {} as Record<SkillCategory, number>;
    for (const skill of skills) {
      result[skill.category] = (result[skill.category] || 0) + 1;
    }
    return result;
  }

  private groupSkillsByDifficulty(skills: EkyteSkill[]): Record<SkillDifficulty, number> {
    const result = {} as Record<SkillDifficulty, number>;
    for (const skill of skills) {
      result[skill.difficulty] = (result[skill.difficulty] || 0) + 1;
    }
    return result;
  }

  private getRecentImprovements(): Array<{ skillId: string; improvement: string; timestamp: Date; }> {
    return Array.from(this.skills.values())
      .filter(skill => skill.learned && skill.lastSuccess)
      .sort((a, b) => (b.lastSuccess?.getTime() || 0) - (a.lastSuccess?.getTime() || 0))
      .slice(0, 5)
      .map(skill => ({
        skillId: skill.id,
        improvement: `Skill "${skill.name}" aprendida`,
        timestamp: skill.lastSuccess!
      }));
  }
} 