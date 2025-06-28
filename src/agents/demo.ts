#!/usr/bin/env node

/**
 * Demo do EkyteNavigatorAgent
 * 
 * Exemplo completo de uso do agente autônomo
 */

import { createEkyteAgent, createEkyteAgentWithPreset, SessionAnalyzer } from './index.js';

async function demoBasico() {
  console.log('🚀 === DEMO BÁSICO DO EKYTE NAVIGATOR AGENT ===');
  
  // Criar agente básico
  const agent = await createEkyteAgent({
    name: 'EkyteDemo',
    ekyteUrl: 'https://app.ekyte.com/#/login', // URL exemplo
    credentials: {
      email: 'bianca_sivero@v4company.com',
      password: 'Cancela@'
    },
    dataDir: './demo/data',
    screenshotsDir: './demo/screenshots',
    learningMode: 'active'
  });
  
  console.log('\n📊 Status inicial do agente:');
  console.log(JSON.stringify(agent.getStatus(), null, 2));
  
  // Listar skills disponíveis
  console.log('\n📚 Skills disponíveis:');
  const skillSystem = agent.getSkillSystem();
  const skills = skillSystem.listSkills();
  
  skills.forEach(skill => {
    console.log(`  ${skill.learned ? '✅' : '❌'} ${skill.name} (${skill.category}/${skill.difficulty})`);
  });
  
  // Iniciar sessão
  console.log('\n🔄 Iniciando sessão...');
  await agent.startSession('https://app.ekyte.com/#/login');
  
  // Executar algumas skills
  try {
    console.log('\n🎯 Executando skill básica...');
    const skillSystem = agent.getSkillSystem();
    const skill = skillSystem.getSkillByName('Acessar Login Ekyte');
    
    if (skill) {
      const skillResult = await skillSystem.executeSkill(skill.id);
      console.log(`   Resultado: ${skillResult.success ? 'Sucesso' : 'Falha'}`);
      console.log(`   Confiança: ${(skillResult.confidence * 100).toFixed(1)}%`);
      console.log(`   Observações: ${skillResult.observations.length}`);
    } else {
      console.log(`   ⚠️  Skill não encontrada`);
    }
    
  } catch (error) {
    console.warn(`   ⚠️  Erro na execução: ${error}`);
  }
  
  // Finalizar sessão
  console.log('\n📝 Finalizando sessão...');
  const finalSession = await agent.endSession();
  
  if (finalSession) {
    const analysis = SessionAnalyzer.analyzeSession(finalSession);
    console.log('\n📈 Análise da sessão:');
    console.log(`   Duração: ${analysis.durationFormatted}`);
    console.log(`   Skills tentadas: ${analysis.skillsAttempted}`);
    console.log(`   Skills aprendidas: ${analysis.skillsLearned}`);
    console.log(`   Taxa de sucesso: ${(analysis.successRate * 100).toFixed(1)}%`);
    console.log(`   Screenshots: ${analysis.screenshotsTaken}`);
  }
  
  // Métricas finais
  console.log('\n📊 Métricas de aprendizado:');
  const metrics = agent.getLearningMetrics();
  console.log(`   Total de skills: ${metrics.totalSkills}`);
  console.log(`   Skills aprendidas: ${metrics.learnedSkills}`);
  console.log(`   Confiança média: ${(metrics.averageConfidence * 100).toFixed(1)}%`);
  
  await agent.stop();
  console.log('\n✅ Demo concluído!');
}

async function demoComparacao() {
  console.log('\n🚀 === DEMO COMPARAÇÃO DE PRESETS ===');
  
  const presets = ['development', 'production', 'testing'] as const;
  const agents = new Map();
  
  // Criar agentes com diferentes presets
  for (const preset of presets) {
    console.log(`\n📦 Criando agente ${preset}...`);
    const agent = await createEkyteAgentWithPreset(preset);
    agents.set(preset, agent);
    
    const status = agent.getStatus();
    console.log(`   Modo de aprendizado: ${status.config.learningMode}`);
    console.log(`   Exploração automática: ${status.config.autoExplore}`);
  }
  
  // Parar todos os agentes
  for (const [preset, agent] of agents) {
    await agent.stop();
    console.log(`✅ Agente ${preset} parado`);
  }
}

async function main() {
  try {
    console.log('🎭 Iniciando demonstrações do EkyteNavigatorAgent...\n');
    
    await demoBasico();
    await demoComparacao();
    
    console.log('\n🎉 Todas as demonstrações concluídas com sucesso!');
    console.log('\n💡 Para usar em produção:');
    console.log('   1. Configure credenciais reais');
    console.log('   2. Ajuste URLs do sistema Ekyte');
    console.log('   3. Configure diretórios de dados');
    console.log('   4. Escolha o preset adequado');
    
  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 