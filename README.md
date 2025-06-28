# UserTools - MCP Server 🚀

Um servidor MCP (Model Context Protocol) que fornece ferramentas avançadas de automação web e navegador para agentes de IA.

## 🎯 **Ferramentas Disponíveis (28 total)** 🆕

### 🤖 **Agentes Autônomos (4 ferramentas)**

- `agents_create` - Criar novo agente EkyteNavigator
- `agents_list` - Listar agentes ativos
- `agents_execute_skill` - Executar skill específica
- `agents_list_skills` - Listar skills disponíveis

### 🏁 **Navegação Básica (2 ferramentas)**

- `puppeteer_navigate` - Navegar para uma URL
- `puppeteer_new_tab` - Abrir URL em nova aba

### 🎮 **Interação Básica (2 ferramentas)**

- `puppeteer_click` - Clicar em um elemento
- `puppeteer_type` - Digitar texto em um elemento

### 🎯 **Interação Avançada (3 ferramentas)**

- `puppeteer_fill` - Preencher campo (limpa antes de digitar)
- `puppeteer_select` - Selecionar opção em dropdown
- `puppeteer_hover` - Hover sobre elemento

### 🧭 **Navegação Avançada (4 ferramentas)**

- `puppeteer_wait_for_element` - Aguardar elemento aparecer
- `puppeteer_scroll` - Scroll da página ou elemento específico
- `puppeteer_go_back` - Voltar página anterior
- `puppeteer_reload` - Recarregar página atual

### 📤 **Extração Básica (2 ferramentas)**

- `puppeteer_screenshot` - Tirar screenshot da página atual
- `puppeteer_get_content` - Obter conteúdo HTML da página

### 📊 **Extração Avançada (4 ferramentas)**

- `puppeteer_get_text` - Extrair texto de elemento
- `puppeteer_get_attribute` - Extrair atributos de elemento
- `puppeteer_get_title` - Obter título da página
- `puppeteer_get_url` - Obter URL atual

### 🗂️ **Gestão de Abas (4 ferramentas)**

- `puppeteer_list_tabs` - Listar todas as abas abertas
- `puppeteer_switch_tab` - Alternar para aba específica
- `puppeteer_close_tab` - Fechar aba específica ou atual
- `puppeteer_duplicate_tab` - Duplicar aba atual

### 🔬 **Avançado (1 ferramenta)**

- `puppeteer_evaluate` - Executar JavaScript no contexto da página

### 🔄 **Chrome Persistente (2 ferramentas)** 🆕

- `puppeteer_get_browser_status` - Status do Chrome persistente
- `puppeteer_close_persistent_browser` - Fechar Chrome manualmente

## 📦 Instalação

```bash
npm install
npm run build
```

## 🧪 Teste

Verificar todas as ferramentas disponíveis:

```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools | length'
# Resultado: 28
```

Listar nomes das ferramentas:

```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq -r '.result.tools[] | .name'
```

## 🔨 Executar

```bash
node build/index.js
# ou
./run.sh
```

## 💡 **Exemplos de Uso das Ferramentas**

### 🤖 **Sistema de Agentes Autônomos** 🆕

#### **Criar Agente com Preset**

```json
{
  "tool": "agents_create",
  "params": {
    "agentId": "ekyte-prod",
    "preset": "production",
    "config": {
      "learningMode": "passive",
      "autoExplore": false
    }
  }
}
```

#### **Executar Skill Específica**

```json
{
  "tool": "agents_execute_skill",
  "params": {
    "agentId": "ekyte-prod",
    "skillId": "acessar-login-ekyte",
    "context": {
      "url": "https://app.ekyte.io/login"
    }
  }
}
```

#### **Listar Skills Aprendidas**

```json
{
  "tool": "agents_list_skills",
  "params": {
    "agentId": "ekyte-prod",
    "filter": {
      "learned": true,
      "category": "navegação"
    }
  }
}
```

### 🔍 **Aguardar Elementos Dinâmicos**

```json
{
  "tool": "puppeteer_wait_for_element",
  "params": {
    "selector": "#dynamic-content",
    "timeout": 10000,
    "visible": true
  }
}
```

### 📜 **Scroll Inteligente**

```json
{
  "tool": "puppeteer_scroll",
  "params": {
    "direction": "down",
    "amount": 800,
    "selector": ".scrollable-div"
  }
}
```

### 📝 **Extrair Texto Específico**

```json
{
  "tool": "puppeteer_get_text",
  "params": {
    "selector": "h1.title",
    "trim": true
  }
}
```

### 🔗 **Extrair Links**

```json
{
  "tool": "puppeteer_get_attribute",
  "params": {
    "selector": "a.download-link",
    "attribute": "href"
  }
}
```

### 🗂️ **Gerenciar Múltiplas Abas**

```json
{
  "tool": "puppeteer_list_tabs",
  "params": {}
}
```

```json
{
  "tool": "puppeteer_switch_tab",
  "params": {
    "tabIndex": 2
  }
}
```

### 🔧 **JavaScript Personalizado**

```json
{
  "tool": "puppeteer_evaluate",
  "params": {
    "script": "document.querySelectorAll('a').length"
  }
}
```

## 📁 Estrutura

```
src/
├── agents/           # 🆕 Sistema de Agentes Autônomos
│   ├── types.ts      # Tipos para agentes, skills, sessões
│   ├── skill-system.ts # Gerenciamento de skills com aprendizado
│   ├── ekyte-navigator.ts # Agente principal autônomo
│   ├── index.ts      # Factory e utilitários de agentes
│   └── demo.ts       # Demonstração funcional
├── tools/
│   ├── agents/       # 🆕 Ferramentas MCP para agentes (4 ferramentas)
│   ├── puppeteer/    # Ferramentas de automação web (22 ferramentas)
│   │   ├── Básicas: navigate, screenshot, click, type, get_content, new_tab
│   │   ├── Fase 1: fill, select, hover, evaluate
│   │   ├── Fase 2: wait_for_element, scroll, go_back, reload
│   │   ├── Fase 3: get_text, get_attribute, get_title, get_url
│   │   └── Fase 4: list_tabs, switch_tab, close_tab, duplicate_tab
│   └── index.ts      # Agregador de todas as ferramentas (28 total)
├── types.ts          # Definições de tipos
├── schemas.ts        # Esquemas de validação
├── utils.ts          # Utilitários
└── index.ts          # Servidor principal
```

## 🆕 **Diferenças-Chave das Ferramentas Melhoradas**

### **`puppeteer_fill` vs `puppeteer_type`**

- **`type`**: Adiciona texto ao que já existe
- **`fill`**: Limpa campo completamente antes de preencher (melhor para formulários)

### **`puppeteer_wait_for_element`**

- Essencial para SPAs (Single Page Applications)
- Aguarda elementos carregarem dinamicamente
- Configura timeout personalizado

### **`puppeteer_scroll`**

- Scroll da página inteira ou elemento específico
- Controle de direção (up/down/left/right)
- Quantidade customizável em pixels

### **Gestão de Abas**

- Controle completo de múltiplas abas
- Listagem com URL e título
- Alternância e fechamento inteligente

## 🎯 **Casos de Uso Avançados**

### **1. Automação de Formulários Complexos**

```bash
1. navigate → wait_for_element → fill → select → click
```

### **2. Scraping de Sites com Scroll Infinito**

```bash
1. navigate → scroll → wait_for_element → get_text → scroll (repetir)
```

### **3. Gestão de Workflow Multi-Aba**

```bash
1. new_tab → list_tabs → switch_tab → navigate → get_content
```

## 🤖 **Sistema de Agentes Autônomos** 🆕

### **Características Principais**

#### **🧠 Aprendizado Evolutivo**

- **8 skills padrão** pré-configuradas para Ekyte
- **Persistência automática** em JSON (dev/test/prod)
- **Sistema de confiança** baseado em tentativas e sucessos
- **Métricas de performance** para cada skill

#### **⚙️ Presets de Configuração**

- **Development**: `learningMode: 'active'`, exploração automática
- **Production**: `learningMode: 'passive'`, operação controlada
- **Testing**: `learningMode: 'aggressive'`, timeouts curtos

#### **📊 Gestão de Sessões**

- **Auto-save** configurável (1-300 segundos)
- **Event system** para monitoramento em tempo real
- **Análise de progresso** de autonomia (0-100%)
- **Controle de timeout** por sessão

#### **🎯 Skills Pré-Configuradas**

```json
{
  "Navegação": ["Acessar Login Ekyte", "Realizar Login"],
  "Interface": ["Explorar Dashboard", "Identificar Menu Principal"],
  "Tarefas": ["Acessar Lista de Tarefas", "Criar Nova Tarefa"],
  "Dados": ["Extrair Dados da Tabela"],
  "Filtros": ["Aplicar Filtros"]
}
```

### **4. Automação Autônoma com Agentes**

```bash
1. new_tab → switch_tab → list_tabs → close_tab
```

### **5. Testes E2E Completos**

```bash
1. navigate → wait_for_element → fill → hover → click → get_text → screenshot
```

## 📚 Documentação

- [EXPANSAO_FERRAMENTAS.md](./EXPANSAO_FERRAMENTAS.md) - Detalhes sobre a refatoração e expansão das ferramentas
- [REMOCAO_FERRAMENTAS.md](./REMOCAO_FERRAMENTAS.md) - Guia completo para remoção segura de ferramentas

## 🏆 **Recursos Destacados**

- ✅ **22 ferramentas** cobrindo todos os casos de uso web
- ✅ **Sistema modular** para fácil manutenção
- ✅ **Gestão de estado** inteligente de browser/abas
- ✅ **Schemas de validação** para todos os parâmetros
- ✅ **Error handling** robusto
- ✅ **Cleanup automático** de recursos
- ✅ **Compatibilidade total** com Gemini CLI

## ⚖️ Licença

MIT

## 🔄 **Chrome Persistente** 🆕

### **O que é Chrome Persistente?**

O sistema agora mantém uma **instância do Chrome sempre aberta**, eliminando a necessidade de reiniciar o navegador a cada uso:

#### **🔄 Funcionalidades:**

- **Reconexão automática**: Se o Chrome for fechado acidentalmente, reconecta automaticamente
- **Dados persistentes**: Cookies, sessões e cache são mantidos entre uso
- **Porta fixa**: Chrome executa na porta 9222 para reconexão
- **Timeout estendido**: 24 horas de inatividade antes de fechar (vs 5 minutos antes)

#### **🎯 Vantagens:**

- ✅ **Performance**: Navegação instantânea sem tempo de inicialização
- ✅ **Sessões persistentes**: Login mantido entre usos
- ✅ **Cache inteligente**: Páginas carregam mais rápido
- ✅ **Debugging**: Chrome DevTools sempre disponível em `http://localhost:9222`

### **Gerenciamento do Chrome Persistente:**

#### **Status do Browser:**

```json
{
  "tool": "puppeteer_get_browser_status",
  "params": {}
}
```

**Retorna:**

```json
{
  "connected": true,
  "totalPages": 3,
  "currentUrl": "https://app.ekyte.com",
  "uptimeMs": 7200000,
  "uptimeFormatted": "2h 0m",
  "persistentMode": true
}
```

#### **Fechar Manualmente (quando necessário):**

```json
{
  "tool": "puppeteer_close_persistent_browser",
  "params": {}
}
```

### **Configurações Persistentes:**

```javascript
// Localização dos dados persistentes
./chrome-user-data/           // Perfil completo do Chrome

// Configurações automáticas
Remote Debugging: localhost:9222
Viewport: 1280x720
Timeout: 24 horas
Auto-reconnect: ✅ Ativo
```

### **🔧 Troubleshooting:**

#### **Chrome não conecta?**

```bash
# 1. Verificar status
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "puppeteer_get_browser_status", "arguments": {}}, "id": 1}' | node build/index.js

# 2. Forçar reinício
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "puppeteer_close_persistent_browser", "arguments": {}}, "id": 1}' | node build/index.js
```

#### **Limpar dados persistentes:**

```bash
# Remover cache e dados de sessão
rm -rf chrome-user-data/
```
