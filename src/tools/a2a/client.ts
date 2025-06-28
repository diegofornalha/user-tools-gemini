
import http from 'http';

export class A2AClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    const requestBody = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1, // ID de requisição, pode ser incrementado para requisições reais
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    return new Promise((resolve, reject) => {
      const req = http.request(this.baseUrl + '/rpc', options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const rpcResponse = JSON.parse(data);
            if (rpcResponse.error) {
              reject(new Error(rpcResponse.error.message));
            } else {
              resolve(rpcResponse.result);
            }
          } catch (e) {
            reject(new Error(`Failed to parse RPC response: ${e}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error(`HTTP request failed: ${e.message}`));
      });

      req.write(requestBody);
      req.end();
    });
  }

  async createAgent(agentId: string, preset?: string): Promise<any> {
    return this.sendRequest('agents_create', { agentId, preset });
  }

  async listAgents(): Promise<any> {
    return this.sendRequest('agents_list', {});
  }

  async executeSkill(agentId: string, skillName: string): Promise<any> {
    return this.sendRequest('agents_execute_skill', { agentId, skillName });
  }

  async listSkills(agentId: string): Promise<any> {
    return this.sendRequest('agents_list_skills', { agentId });
  }
}
