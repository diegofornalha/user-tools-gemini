# Configuração do Servidor MCP (Model Context Protocol)

Para fazer o servidor MCP funcionar e disponibilizar as ferramentas, segui os seguintes passos:

1.  **Instalar as dependências do projeto:**
    Executei o comando `npm install` para baixar e instalar todas as bibliotecas e pacotes necessários definidos no `package.json`.

    ```bash
    npm install
    ```

2.  **Compilar o código TypeScript:**
    Após a instalação das dependências, compilei o código-fonte TypeScript para JavaScript. Isso é necessário porque o servidor é escrito em TypeScript e precisa ser transpilado para JavaScript para ser executado no Node.js. O comando `npm run build` executa o compilador TypeScript (`tsc`).

    ```bash
    npm run build
    ```

Depois de completar esses passos, o servidor MCP estará pronto para ser iniciado e as ferramentas devem ser carregadas corretamente.