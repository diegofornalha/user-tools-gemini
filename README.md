# UserTools - MCP Server

Um servidor MCP (Model Context Protocol) que fornece ferramentas de automação web e navegador para agentes de IA.

## 🚀 Ferramentas Disponíveis (7 total)

### 🔧 Categoria Puppeteer (6 ferramentas)

- `puppeteer_navigate` - Navegar para uma URL
- `puppeteer_screenshot` - Tirar screenshot da página atual
- `puppeteer_click` - Clicar em um elemento
- `puppeteer_type` - Digitar texto em um elemento
- `puppeteer_get_content` - Obter conteúdo HTML da página
- `puppeteer_new_tab` - Abrir URL em nova aba

### 🌐 Categoria Browser Nativo (1 ferramenta)

- `browser_open_url` - Abrir URL em navegador específico (Chrome, Safari, Firefox)

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
│   ├── puppeteer/     # Ferramentas de automação web
│   ├── browser/       # Ferramentas de navegador nativo
│   └── index.ts       # Agregador de todas as ferramentas
├── types.ts           # Definições de tipos
├── schemas.ts         # Esquemas de validação
├── utils.ts           # Utilitários
└── index.ts           # Servidor principal
```

## 📚 Documentação

- [EXPANSAO_FERRAMENTAS.md](./EXPANSAO_FERRAMENTAS.md) - Detalhes sobre a refatoração e expansão das ferramentas
- [REMOCAO_FERRAMENTAS.md](./REMOCAO_FERRAMENTAS.md) - Guia completo para remoção segura de ferramentas

## ⚖️ Licença

MIT
