# 🤖 Sistema de Agentes Autônomos - UserTools MCP

## 🎯 **Visão Geral**

O Sistema de Agentes Autônomos é uma extensão avançada do user-tools-gemini que adiciona **inteligência artificial autonoma** ao conjunto de ferramentas de automação web. 

### **O que são Agentes Autônomos?**

Agentes autônomos são **entidades de software inteligentes** que:
- 🧠 **Aprendem com experiência** (tentativas e sucessos)
- 🎯 **Executam tarefas complexas** autonomamente 
- 📊 **Adaptam comportamento** baseado em contexto
- 💾 **Persistem conhecimento** entre sessões
- 🔄 **Melhoram performance** continuamente

## 🏗️ **Arquitetura do Sistema**

### **📁 Estrutura de Arquivos**

```
src/agents/
├── types.ts              # 🎭 Tipos e interfaces
├── skill-system.ts       # 🧠 Sistema de aprendizado
├── ekyte-navigator.ts    # 🤖 Agente principal
├── index.ts              # 🏭 Factory e utilitários
└── demo.ts               # 🎪 Demonstrações
```

### **🔧 Componentes Principais**

#### **1. EkyteNavigatorAgent** 
Agente principal especializado em automação da plataforma Ekyte.

```typescript
class EkyteNavigatorAgent extends EventEmitter {
  // Sistema de skills com aprendizado evolutivo
  // Gerenciamento de sessões com persistência
  // Configurações flexíveis com presets
  // Event system para monitoramento
}
```

#### **2. SkillSystem**
Gerenciador de habilidades com aprendizado evolutivo.

```typescript
class SkillSystem {
  // 8 skills pré-configuradas para Ekyte
  // Persistência automática em JSON
  // Sistema de confiança baseado em sucessos
  // Métricas de performance por skill
}
```

#### **3. Factory Functions**
Criadores simplificados de agentes com presets.

```typescript
// Criação com preset
const agent = createEkyteAgentWithPreset('production');

// Criação customizada
const agent = createEkyteAgent({
  learningMode: 'active',
  autoExplore: true
});
```

## 🧠 **Sistema de Skills**

### **📚 8 Skills Pré-Configuradas**

#### **🧭 Navegação (2 skills)**
1. **Acessar Login Ekyte** (básico)
   - Navegar para página de login
   - Verificar elementos essenciais
   - Capturar screenshot de evidência

2. **Realizar Login** (intermediário)
   - Preencher credenciais
   - Submeter formulário
   - Aguardar carregamento do dashboard

#### **🎨 Interface (2 skills)**
3. **Explorar Dashboard** (básico)
   - Varrer elementos da interface
   - Identificar seções principais
   - Extrair informações relevantes

4. **Identificar Menu Principal** (intermediário)
   - Localizar elementos de navegação
   - Mapear opções disponíveis
   - Categorizar funcionalidades

#### **📋 Tarefas (2 skills)**
5. **Acessar Lista de Tarefas** (básico)
   - Navegar para seção de tarefas
   - Carregar lista completa
   - Verificar estrutura de dados

6. **Criar Nova Tarefa** (avançado)
   - Abrir formulário de criação
   - Preencher campos obrigatórios
   - Configurar opções avançadas

#### **📊 Dados (1 skill)**
7. **Extrair Dados da Tabela** (intermediário)
   - Identificar estrutura tabular
   - Extrair headers e dados
   - Formatear informações

#### **🔍 Filtros (1 skill)**
8. **Aplicar Filtros** (básico)
   - Localizar controles de filtro
   - Configurar critérios
   - Aplicar e verificar resultados

### **📈 Sistema de Aprendizado**

#### **Métricas de Skill:**
```json
{
  "id": "acessar-login-ekyte",
  "attempts": 15,
  "successCount": 12,
  "confidence": 0.8,
  "avgExecutionTime": 2500,
  "lastAttempt": "2025-06-28T03:44:28.855Z",
  "learned": true
}
```

#### **Níveis de Confiança:**
- **0.0 - 0.3**: 🔴 Skill não confiável
- **0.3 - 0.6**: 🟡 Skill em aprendizado  
- **0.6 - 0.8**: 🟢 Skill confiável
- **0.8 - 1.0**: 🟦 Skill dominada

#### **Evolução Automática:**
```typescript
// Skill melhora automaticamente com uso
if (success) {
  skill.successCount++;
  skill.confidence = Math.min(1.0, skill.confidence + 0.1);
} else {
  skill.attempts++;
  // Confidence ajustada baseada em taxa de sucesso
}
```

## ⚙️ **Sistema de Presets**

### **🛠️ Presets Disponíveis**

#### **Development Preset** 🔧
Otimizado para desenvolvimento e debugging:

```javascript
{
  learningMode: 'active',        // Aprendizado agressivo
  autoExplore: true,             // Exploração automática
  sessionTimeout: 300000,        // 5 minutos
  autoSaveInterval: 30000,       // Auto-save a cada 30s
  screenshotEnabled: true,       // Screenshots de debug
  logLevel: 'debug'              // Logs detalhados
}
```

**📝 Casos de Uso:**
- Desenvolvimento de novas skills
- Debugging de comportamentos
- Exploração de interfaces

#### **Production Preset** 🏭
Otimizado para ambiente de produção:

```javascript
{
  learningMode: 'passive',       // Aprendizado conservador
  autoExplore: false,            // Sem exploração automática
  sessionTimeout: 600000,        // 10 minutos
  autoSaveInterval: 60000,       // Auto-save a cada 1min
  screenshotEnabled: false,      // Screenshots mínimos
  logLevel: 'info'               // Logs essenciais
}
```

**🎯 Casos de Uso:**
- Automação em produção
- Operações críticas
- Performance otimizada

#### **Testing Preset** 🧪
Otimizado para testes automatizados:

```javascript
{
  learningMode: 'aggressive',    // Aprendizado máximo
  autoExplore: true,             // Exploração total
  sessionTimeout: 60000,         // 1 minuto
  autoSaveInterval: 10000,       // Auto-save a cada 10s
  screenshotEnabled: true,       // Screenshots de validação
  logLevel: 'trace'              // Logs máximos
}
```

**⚡ Casos de Uso:**
- Testes automatizados
- Validação rápida
- CI/CD pipelines

## 🔧 **Ferramentas MCP Disponíveis**

### **1. `agents_create`** - Criar Agente
Cria um novo agente EkyteNavigator com configuração específica.

```json
{
  "tool": "agents_create",
  "params": {
    "agentId": "ekyte-prod",
    "preset": "production",
    "config": {
      "learningMode": "passive",
      "autoExplore": false,
      "sessionTimeout": 600000
    }
  }
}
```

**⚙️ Parâmetros:**
- `agentId`: Identificador único do agente
- `preset`: Preset de configuração (optional)
- `config`: Configurações customizadas (optional)

### **2. `agents_list`** - Listar Agentes
Lista todos os agentes ativos com métricas detalhadas.

```json
{
  "tool": "agents_list",
  "params": {}
}
```

**📊 Retorna:**
```json
{
  "agents": [
    {
      "id": "ekyte-prod",
      "status": "active",
      "autonomy": 85,
      "learnedSkills": 6,
      "totalSkills": 8,
      "uptime": "2h 34m",
      "lastActivity": "2025-06-28T03:44:28.855Z"
    }
  ],
  "total": 1,
  "active": 1
}
```

### **3. `agents_execute_skill`** - Executar Skill
Executa uma skill específica com contexto fornecido.

```json
{
  "tool": "agents_execute_skill",
  "params": {
    "agentId": "ekyte-prod",
    "skillId": "acessar-login-ekyte",
    "context": {
      "url": "https://app.ekyte.io/login",
      "screenshot": true
    }
  }
}
```

**🎯 Contexto Opcional:**
- `url`: URL específica para navegação
- `screenshot`: Capturar screenshot durante execução
- `timeout`: Timeout customizado para execução
- `retries`: Número de tentativas em caso de falha

### **4. `agents_list_skills`** - Listar Skills
Lista skills disponíveis com filtros avançados.

```json
{
  "tool": "agents_list_skills",
  "params": {
    "agentId": "ekyte-prod",
    "filter": {
      "learned": true,
      "category": "navegação",
      "difficulty": "básico"
    }
  }
}
```

**🔍 Filtros Disponíveis:**
- `learned`: Skills já aprendidas (true/false)
- `category`: Categoria específica
- `difficulty`: Nível de dificuldade
- `confidence`: Nível mínimo de confiança (0.0-1.0)

## 📊 **Persistência e Dados**

### **🗂️ Estrutura de Dados**

```
data/
├── dev/
│   ├── ekyte-skills.json     # Skills de desenvolvimento
│   ├── sessions/             # Sessões ativas
│   └── screenshots/          # Evidências visuais
├── test/
│   ├── ekyte-skills.json     # Skills de teste
│   ├── sessions/             # Sessões de teste
│   └── test-results/         # Resultados de validação
└── prod/
    ├── ekyte-skills.json     # Skills de produção
    ├── sessions/             # Sessões produtivas
    └── analytics/            # Métricas de performance
```

### **💾 Serialização de Skills**

```json
{
  "skills": [
    {
      "id": "acessar-login-ekyte",
      "name": "Acessar Login Ekyte",
      "description": "Navegar até a página de login e verificar elementos",
      "category": "navegação",
      "difficulty": "básico",
      "learned": true,
      "attempts": 25,
      "successCount": 22,
      "confidence": 0.88,
      "lastAttempt": "2025-06-28T03:44:28.855Z",
      "evidence": [
        "screenshot_login_2025-06-28_03-44-28.png",
        "success_login_2025-06-28_03-44-30.log"
      ],
      "actions": [
        {
          "type": "navigate",
          "url": "https://app.ekyte.io/login"
        },
        {
          "type": "wait_for_element",
          "selector": "#login-form"
        },
        {
          "type": "screenshot",
          "name": "login-page"
        }
      ]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-06-28T03:44:28.855Z",
    "environment": "dev",
    "totalSkills": 8,
    "learnedSkills": 6,
    "averageConfidence": 0.75
  }
}
```

### **🔄 Auto-Save Configurável**

```typescript
// Auto-save baseado no preset
development: autoSaveInterval: 30000,  // 30 segundos
production:  autoSaveInterval: 60000,  // 1 minuto  
testing:     autoSaveInterval: 10000,  // 10 segundos
```

## 🎪 **Exemplos Práticos**

### **🚀 Exemplo 1: Criação Rápida com Preset**

```typescript
import { createEkyteAgentWithPreset } from './agents/index.js';

// Criar agente para desenvolvimento
const devAgent = createEkyteAgentWithPreset('development');

// Monitorar eventos
devAgent.on('skillLearned', (skill) => {
  console.log(`🧠 Skill aprendida: ${skill.name}`);
});

devAgent.on('sessionStarted', (session) => {
  console.log(`🎯 Sessão iniciada: ${session.id}`);
});
```

### **🔧 Exemplo 2: Configuração Customizada**

```typescript
import { createEkyteAgent } from './agents/index.js';

// Configuração customizada
const customAgent = createEkyteAgent({
  agentId: 'ekyte-custom',
  learningMode: 'active',
  autoExplore: true,
  sessionTimeout: 180000,
  autoSaveInterval: 45000,
  skillsFile: 'custom-skills.json',
  screenshotsDir: './screenshots/custom/',
  logLevel: 'info'
});
```

### **🎯 Exemplo 3: Execução de Skills**

```typescript
// Executar skill específica
const result = await customAgent.executeSkill('acessar-login-ekyte', {
  url: 'https://app.ekyte.io/login',
  screenshot: true,
  timeout: 30000
});

if (result.success) {
  console.log('✅ Login realizado com sucesso');
  console.log(`⏱️ Tempo: ${result.executionTime}ms`);
  console.log(`📊 Confiança: ${result.confidence}`);
}
```

### **📊 Exemplo 4: Análise de Progresso**

```typescript
// Obter métricas detalhadas
const metrics = customAgent.getAnalytics();

console.log(`🎯 Autonomia: ${metrics.autonomyLevel}%`);
console.log(`📚 Skills aprendidas: ${metrics.learnedSkills}/${metrics.totalSkills}`);
console.log(`⚡ Performance média: ${metrics.averageExecutionTime}ms`);
console.log(`🎪 Sessões totais: ${metrics.totalSessions}`);
```

## 🎭 **Event System**

### **📡 Eventos Disponíveis**

#### **Eventos de Skill:**
```typescript
agent.on('skillExecuted', (skillId, result) => {
  // Skill foi executada (sucesso ou falha)
});

agent.on('skillLearned', (skill) => {
  // Skill foi marcada como aprendida
});

agent.on('skillImproved', (skillId, oldConfidence, newConfidence) => {
  // Confiança da skill melhorou
});
```

#### **Eventos de Sessão:**
```typescript
agent.on('sessionStarted', (session) => {
  // Nova sessão foi iniciada
});

agent.on('sessionEnded', (session, metrics) => {
  // Sessão foi finalizada com métricas
});

agent.on('sessionSaved', (sessionId) => {
  // Sessão foi salva automaticamente
});
```

#### **Eventos de Sistema:**
```typescript
agent.on('autonomyChanged', (oldLevel, newLevel) => {
  // Nível de autonomia mudou
});

agent.on('error', (error) => {
  // Erro durante execução
});

agent.on('warning', (message) => {
  // Aviso do sistema
});
```

## 🔮 **Roadmap e Expansões Futuras**

### **🎯 Próximas Features**

#### **v2.0 - Agentes Especializados**
- 🌐 **WebAgent**: Agente genérico para qualquer site
- 📧 **EmailAgent**: Especializado em automação de email
- 📊 **DataAgent**: Focado em extração e análise de dados
- 🔄 **WorkflowAgent**: Orquestrador de workflows complexos

#### **v2.1 - Machine Learning**
- 🧠 **Otimização de seletores** com ML
- 📈 **Predição de comportamento** baseado em histórico
- 🎯 **Auto-tuning de parâmetros** para melhor performance
- 🔍 **Detecção automática** de mudanças em interfaces

#### **v2.2 - Integrações Avançadas**
- 🌐 **APIs externas** (Slack, Jira, GitHub)
- 📊 **Dashboards de analytics** em tempo real
- 🔄 **Integração com CI/CD** pipelines
- 📱 **Mobile automation** para apps híbridos

### **🚀 Contribuições**

O sistema foi projetado para ser extensível. Para adicionar novos agentes ou skills:

1. **Definir tipos** em `agents/types.ts`
2. **Implementar skills** no sistema de persistência
3. **Criar agente** seguindo padrão `EkyteNavigatorAgent`
4. **Adicionar ferramentas MCP** em `tools/agents/`
5. **Documentar** e criar testes

---

## 🏆 **Conclusão**

O Sistema de Agentes Autônomos transforma o user-tools-gemini de uma **coleção de ferramentas** em um **ecossistema inteligente** capaz de:

- 🧠 **Aprender autonomamente** com cada interação
- 🎯 **Executar tarefas complexas** sem supervisão humana
- 📊 **Adaptar-se a mudanças** nas interfaces automaticamente
- 💾 **Preservar conhecimento** entre sessões e ambientes
- 🔄 **Melhorar continuamente** sua performance

**Resultado:** Automação verdadeiramente inteligente que evolui com o uso. 🚀✨ 