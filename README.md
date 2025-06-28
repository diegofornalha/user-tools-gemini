# UserTools - MCP Server

Um servidor MCP (Model Context Protocol) que fornece ferramentas de automação web e navegador para agentes de IA.

## 🚀 Ferramentas Disponíveis (10 total)

### 🔧 Categoria Puppeteer (10 ferramentas)

#### **Navegação:**
- `puppeteer_navigate` - Navegar para uma URL
- `puppeteer_new_tab` - Abrir URL em nova aba

#### **Interação:**
- `puppeteer_click` - Clicar em um elemento
- `puppeteer_type` - Digitar texto em um elemento
- `puppeteer_fill` - Preencher campo (limpa antes de digitar) 🆕
- `puppeteer_select` - Selecionar opção em dropdown 🆕
- `puppeteer_hover` - Hover sobre elemento 🆕

#### **Extração:**
- `puppeteer_screenshot` - Tirar screenshot da página atual
- `puppeteer_get_content` - Obter conteúdo HTML da página

#### **Avançado:**
- `puppeteer_evaluate` - Executar JavaScript no contexto da página 🆕

## 📦 Instalação

```bash
npm install
npm run build
```

## 🧪 Teste

Verificar ferramentas disponíveis:

```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | node build/index.js | jq '.result.tools[] | .name'
```

## 🔨 Executar

```bash
node build/index.js
# ou
./run.sh
```

## 📁 Estrutura

```
src/
├── tools/
│   ├── puppeteer/     # Ferramentas de automação web (10 ferramentas)
│   └── index.ts       # Agregador de todas as ferramentas
├── types.ts           # Definições de tipos
├── schemas.ts         # Esquemas de validação
├── utils.ts           # Utilitários
└── index.ts           # Servidor principal
```

## 🆕 Novas Ferramentas Adicionadas

### `puppeteer_fill` - Preenchimento Inteligente
```json
{
  "selector": "#email",
  "value": "user@example.com"
}
```
Diferença do `type`: Limpa o campo antes de preencher.

### `puppeteer_select` - Seleção em Dropdowns
```json
{
  "selector": "#country",
  "value": "Brazil"
}
```

### `puppeteer_hover` - Hover sobre Elementos
```json
{
  "selector": ".menu-item"
}
```
Útil para menus dropdown e tooltips.

### `puppeteer_evaluate` - Execução de JavaScript
```json
{
  "script": "document.title"
}
```
Executa qualquer código JavaScript no contexto da página.

## 📚 Documentação

- [EXPANSAO_FERRAMENTAS.md](./EXPANSAO_FERRAMENTAS.md) - Detalhes sobre a refatoração e expansão das ferramentas
- [REMOCAO_FERRAMENTAS.md](./REMOCAO_FERRAMENTAS.md) - Guia completo para remoção segura de ferramentas

## ⚖️ Licença

MIT
