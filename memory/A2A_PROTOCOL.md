# Integração do Protocolo A2A (Agent-to-Agent)

Este documento registra a integração do protocolo A2A no projeto `user-tools-gemini`.

## O que é o A2A?

A2A (Agent2Agent) é um protocolo aberto que permite a comunicação e colaboração entre agentes de IA de diferentes plataformas. Sua arquitetura é baseada em JSON-RPC 2.0 sobre HTTP(S).

## Benefícios da Integração

- **Interoperabilidade:** Permite que o `EkyteNavigatorAgent` se comunique com outros agentes de IA.
- **Automação Distribuída:** Orquestração de múltiplos agentes especializados para tarefas complexas.
- **Padrão Aberto:** Alinha o projeto com um padrão emergente na comunidade de IA.

## Implementação

O SDK do A2A foi instalado via npm:

```bash
npm install @a2a-js/sdk
```

## Plano de Integração com Agentes Existentes

A integração do A2A será feita de forma modular para complementar a arquitetura atual do `user-tools-gemini`.

### Fase 1: Criação do Adaptador A2A

1.  **Novo Módulo (`src/tools/a2a/`):** Criar um novo diretório para encapsular toda a lógica do A2A.
2.  **Servidor A2A:** Dentro do novo módulo, implementar um servidor A2A que rodará em paralelo ao servidor MCP. Ele será responsável por expor as habilidades do nosso agente para a rede A2A.
3.  **Cartão do Agente Dinâmico:** O servidor A2A irá gerar um "Agent Card" dinamicamente, listando as `skills` que o `EkyteNavigatorAgent` aprendeu, consultando o `SkillSystem`.

### Fase 2: Exposição das Skills Atuais

1.  **Mapeamento de Skills:** O adaptador A2A irá mapear as `skills` internas (ex: `acessar-login-ekyte`) para um formato compatível com o protocolo A2A.
2.  **Execução de Skills via A2A:** O servidor A2A receberá requisições de outros agentes e as traduzirá em chamadas para o `skillSystem.executeSkill()` do nosso agente.

### Fase 3: Novas Ferramentas MCP para Interação A2A

Para permitir que nosso agente principal interaja com outros agentes A2A, criaremos novas ferramentas MCP:

-   `a2a_discover_agents`: Procura por outros agentes na rede.
-   `a2a_get_agent_card`: Obtém as habilidades de um agente específico.
-   `a2a_delegate_task`: Delega uma `skill` para outro agente executar.

### Fase 4: Integração no `EkyteNavigatorAgent`

1.  **Consumo das Novas Ferramentas:** O `EkyteNavigatorAgent` será atualizado para poder utilizar as novas ferramentas `a2a_*`.
2.  **Lógica de Delegação:** Implementar uma lógica de decisão para que o agente possa determinar quando uma tarefa deve ser executada localmente ou delegada para outro agente na rede A2A.

### Fase 5: Testes e Documentação

1.  **Testes de Integração:** Criar testes que simulam a comunicação entre o nosso agente e um agente A2A mock.
2.  **Atualização da Documentação:** Detalhar as novas capacidades no `README.md` e criar um novo documento `A2A_INTEGRATION.md` na pasta `docs/`.