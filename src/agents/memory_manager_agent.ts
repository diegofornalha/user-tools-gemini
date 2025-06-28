import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

// Schema para a skill de leitura de arquivo de memória
const ReadMemoryFileSchema = z.object({
  filename: z.string().min(1).endsWith('.md'),
});

/**
 * Lê o conteúdo de um arquivo Markdown da pasta 'memory'.
 * @param params - Objeto contendo o nome do arquivo.
 * @returns O conteúdo do arquivo.
 */
export async function handleReadMemoryFile(params: { filename: string }) {
  const validated = ReadMemoryFileSchema.parse(params);
  const memoryFolderPath = path.join(process.cwd(), 'memory'); // Assumindo que 'memory' está na raiz do user-tools-gemini
  const filePath = path.join(memoryFolderPath, validated.filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, filename: validated.filename, content };
  } catch (error) {
    throw new Error(
      `Erro ao ler arquivo de memória ${validated.filename}: ${error}`,
    );
  }
}

// Exportações para integração com o sistema de ferramentas
export const memoryManagerHandlers = {
  read_memory_file: handleReadMemoryFile,
};

export const memoryManagerTools = [
  {
    name: 'read_memory_file',
    description: 'Lê o conteúdo de um arquivo Markdown da pasta de memória.',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'O nome do arquivo Markdown (ex: AGENTES.md).',
        },
      },
      required: ['filename'],
    },
  },
];
