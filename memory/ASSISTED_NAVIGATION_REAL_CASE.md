# Navegação Assistida com o Agente EkyteNavigator - Caso Real

Este documento detalha um exemplo prático de navegação assistida utilizando o agente EkyteNavigator, demonstrando a interação passo a passo entre o usuário e o agente para realizar tarefas em um navegador.

## Cenário

O objetivo é navegar até a página de login do Ekyte, realizar o login com credenciais fornecidas e, em seguida, navegar para a página de "Boards" (Conhecimento), confirmando a presença na página com screenshots.

## Passos da Navegação Assistida

### 1. Criação e Ativação do Agente

Primeiro, um agente é criado e ativado. Este agente manterá uma sessão de navegador aberta, permitindo comandos sequenciais.

```bash
# Comando para criar o agente
print(default_api.agents_create(agentId="meu_assistente"))
```

### 2. Navegação para a Página de Login e Tentativa de Login

O agente é instruído a navegar para a página de login do Ekyte e tentar realizar o login usando as credenciais configuradas previamente no `demo.ts`.

```bash
# Comando para acessar a página de login (skill pré-definida)
print(default_api.agents_execute_skill(agentId="meu_assistente", skillName="Acessar Login Ekyte"))

# Comando para tentar realizar o login (skill pré-definida)
print(default_api.agents_execute_skill(agentId="meu_assistente", skillName="Realizar Login"))
```

- **Intervenção do Usuário:** Após a execução da skill "Realizar Login", o usuário confirmou que o login foi bem-sucedido (indicando que a intervenção manual pode ter ocorrido ou que a automação foi eficaz).

### 3. Confirmação do Login com Screenshot

Para confirmar o estado pós-login, o usuário solicitou um screenshot da página atual.

```bash
# Comando para tirar um screenshot após o login
print(default_api.puppeteer_screenshot(path="ekyte_login_screenshot.png"))
```

### 4. Navegação para a Página de Boards (Conhecimento)

O agente é então instruído a navegar diretamente para a página de "Boards" (Conhecimento).

```bash
# Comando para navegar diretamente para a página de Boards
print(default_api.puppeteer_navigate(url="https://app.ekyte.com/#/boards?&isModel=0&createdBy=10&active=1&view=panel"))
```

### 5. Verificação da URL e Screenshot da Página de Boards

Após a navegação, a URL atual é verificada para garantir que o agente está na página correta, e um novo screenshot é tirado para documentar o estado.

```bash
# Comando para obter a URL atual e verificar
print(default_api.puppeteer_get_url())

# Comando para tirar um screenshot da página de Boards
print(default_api.puppeteer_screenshot(path="ekyte_boards_screenshot.png"))
```

## Conclusão

Este caso de uso demonstra a eficácia da navegação assistida, onde o agente executa comandos programáticos e o usuário fornece feedback e direcionamento em pontos chave. Essa abordagem híbrida é poderosa para cenários que exigem automação combinada com a inteligência e validação humana.
