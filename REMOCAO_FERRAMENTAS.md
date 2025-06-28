# Guia de Remoção de Ferramentas do UserTools MCP Server

## 🎯 Caso de Uso: Remoção da Ferramenta `greeting`

Este documento explica o processo completo de remoção de ferramentas do sistema modular do UserTools MCP Server, usando como exemplo a remoção da ferramenta `greeting` que era apenas para demonstração.

## 🔍 Contexto da Remoção

### Por que remover a ferramenta `greeting`?

- ✅ Era apenas uma ferramenta de demonstração
- ✅ Não agregava valor real ao projeto
- ✅ Limpeza do código para manter apenas ferramentas úteis
- ✅ Redução da complexidade desnecessária

### Estado Antes da Remoção:

```
Ferramentas totais: 9
- 7 ferramentas Puppeteer (úteis)
- 1 ferramenta Browser (útil)
- 1 ferramenta Greeting (demonstração) ❌
```

### Estado Após a Remoção:

```
Ferramentas totais: 8
- 7 ferramentas Puppeteer (úteis) ✅
- 1 ferramenta Browser (útil) ✅
```

## 🏗️ Arquitetura Modular: Como Funciona a Remoção

### Estrutura Original:

```
src/tools/
├── puppeteer/
│   └── index.ts       # 7 ferramentas
├── browser/
│   └── index.ts       # 1 ferramenta
├── greeting/          # ❌ PARA REMOVER
│   └── index.ts       # 1 ferramenta de demo
└── index.ts           # Agregador principal
```

### Pontos de Integração a Modificar:

```typescript
// 📍 src/tools/index.ts - Pontos que referenciam greeting:

1. Import das ferramentas:
   import { greetingTools, handleGreeting } from './greeting/index.js';

2. Array de todas as ferramentas:
   export const allTools = [...puppeteerTools, ...browserTools, ...greetingTools];

3. Mapa de handlers:
   export const toolHandlers = {
     // ... outros handlers
     greeting: handleGreeting,
   }
```

## 🔧 Processo Step-by-Step de Remoção

### **Passo 1: Deletar o Módulo da Ferramenta**

```bash
# Comando executado:
rm -rf src/tools/greeting/
```

**Arquivos removidos:**

- ❌ `src/tools/greeting/index.ts`

**Conteúdo que foi removido:**

```typescript
// src/tools/greeting/index.ts (DELETADO)
export const greetingTools = [
  {
    name: 'greeting',
    description: 'Cumprimenta o usuário',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome para cumprimentar' },
      },
    },
  },
];

export async function handleGreeting(params: { name?: string }) {
  const name = params.name || 'usuário';
  return successResponse(
    { message: `Olá, ${name}!` },
    `Cumprimento enviado para ${name}`,
  );
}
```

### **Passo 2: Atualizar o Agregador Principal**

**Arquivo:** `src/tools/index.ts`

#### Antes (com greeting):

```typescript
// ❌ IMPORTS COM GREETING
import { puppeteerTools } from './puppeteer/index.js';
import { browserTools } from './browser/index.js';
import { greetingTools } from './greeting/index.js'; // ❌ REMOVER

// ❌ EXPORT COM GREETING
export { greetingTools, handleGreeting } from './greeting/index.js'; // ❌ REMOVER

// ❌ ARRAY COM GREETING
export const allTools = [
  ...puppeteerTools,
  ...browserTools,
  ...greetingTools, // ❌ REMOVER
];

// ❌ HANDLERS COM GREETING
import { handleGreeting } from './greeting/index.js'; // ❌ REMOVER

export const toolHandlers = {
  // ... outros handlers
  greeting: handleGreeting, // ❌ REMOVER
} as const;
```

#### Depois (sem greeting):

```typescript
// ✅ IMPORTS SEM GREETING
import { puppeteerTools } from './puppeteer/index.js';
import { browserTools } from './browser/index.js';
// ✅ Linha do greeting removida

// ✅ EXPORTS SEM GREETING
// ✅ Linha do greeting removida

// ✅ ARRAY SEM GREETING
export const allTools = [...puppeteerTools, ...browserTools];

// ✅ HANDLERS SEM GREETING
// ✅ Import do greeting removido

export const toolHandlers = {
  // ... outros handlers (sem greeting)
} as const;
```

### **Passo 3: Recompilar o Projeto**

```bash
# Comando executado:
npm run build
```

**Resultado esperado:**

```
✅ Compilação bem-sucedida
✅ Nenhum erro de TypeScript
✅ Build gerado em /build
```

### **Passo 4: Verificar a Remoção**

#### Teste 1: Listar ferramentas

```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools[] | .name'
```

**Resultado esperado:**

```
"puppeteer_navigate"       ✅
"puppeteer_screenshot"     ✅
"puppeteer_click"          ✅
"puppeteer_type"           ✅
"puppeteer_get_content"    ✅
"puppeteer_new_tab"        ✅
"open_browser"             ✅
"browser_open_url"         ✅
```

**❌ "greeting" NÃO deve aparecer**

#### Teste 2: Contar ferramentas

```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools | length'
```

**Resultado esperado:**

```
8  ✅ (eram 9 antes)
```

#### Teste 3: Servidor funcional

```bash
node startup.cjs
```

**Resultado esperado:**

```
✓ Servidor respondeu em XXXms
✅ Sem erros de inicialização
```

## 📝 Atualização da Documentação

### **Passo 5: Corrigir Documentação Existente**

#### Arquivo: `EXPANSAO_FERRAMENTAS.md`

**Mudanças necessárias:**

```markdown
// ANTES:

- O projeto tinha 9 ferramentas disponíveis
- tools: allTools, // 🎉 TODAS as 9 ferramentas automaticamente

// DEPOIS:

- O projeto tinha 7 ferramentas disponíveis  
- tools: allTools, // 🎉 TODAS as 7 ferramentas automaticamente
```

**Seções removidas:**

```markdown
❌ #### **Categoria Utilitários (1 ferramenta):**
❌ `json
❌ [
❌   {
❌     "name": "greeting",
❌     "description": "Cumprimenta o usuário"
❌   }
❌ ]
❌ `

❌ "greeting" # 🆕 NOVA - Exemplo/teste
```

### **Passo 6: Criar/Atualizar README**

**Arquivo:** `README.md`

```markdown
## 🚀 Ferramentas Disponíveis (8 total)

### 🔧 Categoria Puppeteer (7 ferramentas)

- `puppeteer_navigate` - Navegar para uma URL
- `puppeteer_screenshot` - Tirar screenshot da página atual
- `puppeteer_click` - Clicar em um elemento
- `puppeteer_type` - Digitar texto em um elemento
- `puppeteer_get_content` - Obter conteúdo HTML da página
- `puppeteer_new_tab` - Abrir URL em nova aba
- `open_browser` - Abrir URL no navegador padrão do sistema

### 🌐 Categoria Browser Nativo (1 ferramenta)

- `browser_open_url` - Abrir URL em navegador específico
```

## 🧩 Template Genérico para Remoção de Ferramentas

### Para remover qualquer ferramenta do sistema:

#### 1. **Identificar a ferramenta**

```bash
# Listar ferramentas atuais
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools[] | .name'

# Encontrar onde está definida
find src/tools -name "*.ts" -exec grep -l "NOME_DA_FERRAMENTA" {} \;
```

#### 2. **Remover do módulo específico**

```bash
# Se a ferramenta está em um módulo próprio:
rm -rf src/tools/NOME_DO_MODULO/

# Se está compartilhando módulo, editar manualmente:
# - Remover do array de ferramentas
# - Remover o handler
# - Remover exports
```

#### 3. **Atualizar agregador principal** (`src/tools/index.ts`)

```typescript
// Remover imports:
import { FERRAMENTA_Tools, handleFERRAMENTA } from './MODULO/index.js';

// Remover do export:
export { FERRAMENTA_Tools, handleFERRAMENTA } from './MODULO/index.js';

// Remover do allTools:
export const allTools = [
  ...puppeteerTools,
  ...browserTools,
  // ...FERRAMENTA_Tools     // ❌ REMOVER
];

// Remover do toolHandlers:
export const toolHandlers = {
  // FERRAMENTA_NOME: handleFERRAMENTA,    // ❌ REMOVER
} as const;
```

#### 4. **Testar e verificar**

```bash
# Recompilar
npm run build

# Verificar ferramentas
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools[] | .name'

# Testar servidor
node startup.cjs
```

#### 5. **Atualizar documentação**

- Corrigir números de ferramentas totais
- Remover da lista de funcionalidades
- Atualizar exemplos se necessário

#### 6. **Commit das mudanças**

```bash
git add -A
git commit -m "Remove ferramenta NOME_DA_FERRAMENTA

- Remove módulo NOME_DO_MODULO/
- Atualiza src/tools/index.ts
- Corrige documentação para N ferramentas
- Ferramenta removida: NOME_DA_FERRAMENTA (motivo)"
```

## ⚠️ Checklist de Remoção Segura

### Antes de remover:

- [ ] **Verificar dependências**: Outras ferramentas usam esta?
- [ ] **Backup**: Fazer commit antes da remoção
- [ ] **Documentar motivo**: Por que está sendo removida?
- [ ] **Testar impacto**: Sistema funciona sem ela?

### Durante a remoção:

- [ ] **Remover arquivos físicos** do módulo
- [ ] **Atualizar imports** no agregador
- [ ] **Remover do allTools** array
- [ ] **Remover do toolHandlers** map
- [ ] **Recompilar** o projeto
- [ ] **Testar funcionalidade** restante

### Após a remoção:

- [ ] **Verificar lista** de ferramentas
- [ ] **Testar servidor** funcional
- [ ] **Atualizar documentação**
- [ ] **Corrigir números** totais
- [ ] **Commit mudanças** com mensagem clara
- [ ] **Atualizar README** se necessário

## ✨ Benefícios da Remoção Bem Feita

### 1. **Código Mais Limpo**

- ✅ Menos complexidade desnecessária
- ✅ Foco apenas em ferramentas úteis
- ✅ Manutenção mais fácil

### 2. **Performance Melhorada**

- ✅ Menos código carregado na memória
- ✅ Inicialização mais rápida
- ✅ Menos pontos de falha

### 3. **Documentação Precisa**

- ✅ Lista atualizada de funcionalidades
- ✅ Números corretos nas descrições
- ✅ Exemplos relevantes

### 4. **Sistema Modular Mantido**

- ✅ Arquitetura preservada
- ✅ Facilita futuras remoções
- ✅ Adições continuam simples

## 🚨 Armadilhas Comuns

### ❌ **Erro 1: Esquecer de atualizar imports**

```typescript
// Problema:
import { greetingTools } from './greeting/index.js'; // ❌ Módulo deletado

// Resultado: Erro de compilação
```

### ❌ **Erro 2: Deixar referências no toolHandlers**

```typescript
// Problema:
export const toolHandlers = {
  greeting: handleGreeting, // ❌ Handler removido mas referência mantida
};

// Resultado: Erro de runtime
```

### ❌ **Erro 3: Não atualizar documentação**

```markdown
❌ Problema: README diz "9 ferramentas" mas só tem 8
❌ Resultado: Confusão e documentação incorreta
```

### ❌ **Erro 4: Não testar após remoção**

```bash
❌ Problema: Não rodar npm run build + testes
❌ Resultado: Erros descobertos apenas em produção
```

## 🎯 Resultado Final: Caso `greeting`

### ✅ **Sucesso da Remoção:**

**Antes:**

- 9 ferramentas total
- Código incluía demonstração desnecessária
- Documentação inconsistente

**Depois:**

- 7 ferramentas focadas e úteis
- Código limpo sem demonstrações
- Documentação precisa e atualizada

### 📊 **Impacto Medido:**

```bash
# Verificação final:
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools | length'
# Resultado: 8 ✅

# Teste de funcionalidade:
node startup.cjs
# Resultado: ✓ Servidor respondeu em XXXms ✅

# Status do projeto:
git status
# Resultado: Commit realizado com sucesso ✅
```

---

## 🎯 Caso de Uso Adicional: Remoção da Ferramenta `open_browser`

### **Learnings Importantes: Ferramenta em Módulo Compartilhado**

Após o caso `greeting`, removemos também a ferramenta `open_browser`, que estava **dentro do módulo puppeteer** (não em módulo próprio). Isso revelou nuances importantes:

### **🔍 Diferença Crítica: Módulo Próprio vs. Módulo Compartilhado**

#### **Caso 1: `greeting` (Módulo Próprio)**
```
src/tools/greeting/     # ✅ Módulo próprio
└── index.ts           # Contém apenas a ferramenta greeting
```
**Solução:** Deletar pasta inteira (`rm -rf src/tools/greeting/`)

#### **Caso 2: `open_browser` (Módulo Compartilhado)**
```
src/tools/puppeteer/   # ❌ Módulo compartilhado
└── index.ts           # Contém 7 ferramentas, incluindo open_browser
```
**Solução:** Edição manual seletiva de componentes específicos

### **📋 Processo Refinado para Módulo Compartilhado**

#### **Passo 1: Identificar Componentes da Ferramenta**
```bash
# Buscar todas as referências
grep -n "open_browser\|OpenBrowser" src/tools/puppeteer/index.ts
```

**Resultado encontrado:**
- ✅ Schema: `OpenBrowserSchema`
- ✅ Handler: `handleOpenBrowser()`  
- ✅ Metadados: entrada no array `puppeteerTools`
- ✅ Imports: `exec`, `promisify` (só usados por esta ferramenta)

#### **Passo 2: Remoção Seletiva (Ordem Importante!)**

1️⃣ **Remover Schema:**
```typescript
// ❌ REMOVER
export const OpenBrowserSchema = z.object({
  url: z.string().url('URL inválida fornecida'),
});
```

2️⃣ **Remover Handler:**
```typescript
// ❌ REMOVER - Função completa
export async function handleOpenBrowser(params: { url: string }) {
  // ... todo o código da função
}
```

3️⃣ **Remover Metadados:**
```typescript
// ❌ REMOVER - Entrada do array
{
  name: 'open_browser',
  description: 'Open URL in the system default browser',
  inputSchema: { /* ... */ },
},
```

4️⃣ **Remover Imports Não Utilizados:**
```typescript
// ❌ REMOVER - Imports que só esta ferramenta usava
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
```

### **⚠️ Armadilhas Descobertas: Módulo Compartilhado**

#### **❌ Erro Novo: Imports Órfãos**
```bash
# Erro de compilação:
src/tools/puppeteer/index.ts:21:7 - error TS6133: 'execAsync' is declared but its value is never read.
```

**Problema:** Quando removemos a ferramenta, imports que só ela usava ficaram órfãos.

**Solução:** Sempre verificar e remover imports não utilizados:
```bash
# Após remoção, verificar imports órfãos
npm run build  # Vai mostrar os erros TS6133
```

#### **❌ Erro Novo: Ordem de Remoção Importa**
Se remover o handler antes de remover as referências no agregador:
```typescript
// Isso causa erro se handler já foi removido:
export const toolHandlers = {
  open_browser: handleOpenBrowser,  // ❌ handleOpenBrowser não existe mais
}
```

**Solução:** Ordem correta:
1. Remover do agregador (`src/tools/index.ts`)
2. Depois remover do módulo específico

### **📊 Comparação: Dois Tipos de Remoção**

| Aspecto | Módulo Próprio (`greeting`) | Módulo Compartilhado (`open_browser`) |
|---------|----------------------------|----------------------------------------|
| **Complexidade** | 🟢 Simples | 🟡 Moderada |
| **Arquivos afetados** | 2 arquivos | 2 arquivos |
| **Comando principal** | `rm -rf pasta/` | Edição manual seletiva |
| **Imports órfãos** | ❌ Não acontece | ✅ Possível, verificar |
| **Schemas** | ❌ Removidos com pasta | ✅ Devem ser removidos manualmente |
| **Risco de erro** | 🟢 Baixo | 🟡 Médio |

### **🧩 Template Atualizado: Detecção do Tipo**

#### **Etapa 0: Identificar Tipo de Módulo**
```bash
# 1. Encontrar onde a ferramenta está definida
find src/tools -name "*.ts" -exec grep -l "NOME_DA_FERRAMENTA" {} \;

# 2. Verificar se tem módulo próprio
ls -la src/tools/ | grep NOME_DA_FERRAMENTA

# 3. Determinar estratégia
```

**Se tem pasta própria:** Seguir processo original (caso `greeting`)  
**Se está em módulo compartilhado:** Seguir novo processo (caso `open_browser`)

### **📈 Resultado Final: `open_browser`**

#### **✅ Sucesso da Remoção:**

**Estado final:**
```bash
# Verificação: 7 ferramentas (era 8)
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools | length'
# Resultado: 7 ✅

# Ferramentas restantes:
"puppeteer_navigate"     ✅
"puppeteer_screenshot"   ✅  
"puppeteer_click"        ✅
"puppeteer_type"         ✅
"puppeteer_get_content"  ✅
"puppeteer_new_tab"      ✅
```

#### **🎓 Novos Learnings Aplicados:**
- ✅ Remoção seletiva em módulo compartilhado
- ✅ Detecção e remoção de imports órfãos  
- ✅ Ordem correta de remoção
- ✅ Validação de schemas específicos

### **📚 Documentação Atualizada:**

Atualizamos também toda a documentação:
- `README.md`: 7 ferramentas (era 8)
- `EXPANSAO_FERRAMENTAS.md`: Referencias corrigidas
- `REMOCAO_FERRAMENTAS.md`: Este novo caso de uso

---

**Conclusão Expandida**: Este documento agora cobre **três cenários completos** de remoção:
1. **Módulo próprio** (`greeting`) - Ferramenta de demonstração
2. **Módulo compartilhado** (`open_browser`) - Processo complexo  
3. **Módulo próprio** (`browser_open_url`) - Substituição por ferramenta avançada

Qualquer ferramenta futura pode ser removida seguindo um destes três padrões, garantindo remoção segura e completa. 🚀

## 🎯 Caso de Uso Adicional: Remoção da Ferramenta `browser_open_url`

### **Contexto: Substituição por Ferramenta Mais Avançada**

**Data:** Janeiro 2025  
**Motivo:** Usuário reportou ter ferramenta mais avançada, tornando `browser_open_url` redundante

### **Estado Antes da Remoção:**

```
Ferramentas totais: 7
- 6 ferramentas Puppeteer (úteis) ✅
- 1 ferramenta Browser (redundante) ❌
```

### **Estado Após a Remoção:**

```
Ferramentas totais: 6
- 6 ferramentas Puppeteer (úteis) ✅
```

### **🔧 Processo Executado:**

#### **Tipo Identificado:** Módulo Próprio ✅
- Ferramenta localizada em: `src/tools/browser/`
- Estratégia aplicada: Remoção completa do módulo (igual ao caso `greeting`)

#### **Passos Executados:**

1️⃣ **Verificação inicial:**
```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools | length'
# Resultado: 7 ferramentas
```

2️⃣ **Localização da ferramenta:**
```bash
find src/tools -name "*.ts" -exec grep -l "browser_open_url" {} \;
# Resultado: src/tools/browser/index.ts, src/tools/index.ts
```

3️⃣ **Remoção do módulo:**
```bash
rm -rf src/tools/browser/
```

4️⃣ **Atualização do agregador:**
- ❌ Removido: `import { browserTools } from './browser/index.js';`
- ❌ Removido: `export { browserTools, handleOpenUrl } from './browser/index.js';`
- ❌ Removido: `...browserTools` do array `allTools`
- ❌ Removido: `import { handleOpenUrl } from './browser/index.js';`
- ❌ Removido: `browser_open_url: handleOpenUrl` do `toolHandlers`

5️⃣ **Recompilação:**
```bash
npm run build
# Resultado: ✅ Sucesso, sem erros
```

6️⃣ **Verificação final:**
```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools | length'
# Resultado: 6 ✅ (era 7)

node startup.cjs
# Resultado: ✓ Servidor respondeu em 263ms ✅
```

### **📋 Ferramentas Restantes:**

```
"puppeteer_navigate"     ✅
"puppeteer_screenshot"   ✅  
"puppeteer_click"        ✅
"puppeteer_type"         ✅
"puppeteer_get_content"  ✅
"puppeteer_new_tab"      ✅
```

### **📝 Documentação Atualizada:**

- ✅ `README.md`: Corrigido de 7 para 6 ferramentas
- ✅ Removida seção "Categoria Browser Nativo"
- ✅ Atualizada estrutura de pastas na documentação

### **✨ Resultado Final:**

**✅ Remoção bem-sucedida usando o padrão "Módulo Próprio"**

- Sistema mais limpo e focado
- 6 ferramentas Puppeteer mantidas e funcionais
- Documentação sincronizada
- Servidor operacional sem erros

---

**Conclusão Expandida**: Este documento agora cobre **três cenários completos** de remoção:
1. **Módulo próprio** (`greeting`) - Ferramenta de demonstração
2. **Módulo compartilhado** (`open_browser`) - Processo complexo  
3. **Módulo próprio** (`browser_open_url`) - Substituição por ferramenta avançada

Qualquer ferramenta futura pode ser removida seguindo um destes três padrões, garantindo remoção segura e completa. 🚀
