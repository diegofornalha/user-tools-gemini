
import http from 'http';
import { agentsHandlers } from '../agents/index.js';

const PORT = 8080; // Porta padrão para o servidor A2A

export class A2AServer {
  private server: http.Server;

  constructor() {
    this.server = http.createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/rpc') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const rpcRequest = JSON.parse(body);
            const { method, params, id } = rpcRequest;

            let result;
            let error;

            try {
              // Mapear métodos RPC para manipuladores de agentes
              if (method === 'agents_create') {
                result = await agentsHandlers.agents_create(params);
              } else if (method === 'agents_list') {
                result = await agentsHandlers.agents_list();
              } else if (method === 'agents_execute_skill') {
                result = await agentsHandlers.agents_execute_skill(params);
              } else if (method === 'agents_list_skills') {
                result = await agentsHandlers.agents_list_skills(params);
              } else {
                error = { code: -32601, message: 'Method not found' };
              }
            } catch (e: any) {
              error = { code: -32000, message: e.message };
            }

            const rpcResponse = {
              jsonrpc: '2.0',
              result,
              error,
              id,
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rpcResponse));
          } catch (e: any) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                jsonrpc: '2.0',
                error: { code: -32700, message: 'Parse error', data: e.message },
                id: null,
              }),
            );
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32601, message: 'Not Found' },
            id: null,
          }),
        );
      }
    });
  }

  start(): void {
    this.server.listen(PORT, () => {
      console.log(`A2A Server running on port ${PORT}`);
    });
  }

  stop(): void {
    this.server.close(() => {
      console.log('A2A Server stopped');
    });
  }
}
