import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

// Schema para a skill de leitura de arquivo de memória
const ReadMemoryFileSchema = z.object({
  filename: z.string().min(1).endsWith('.md'),
});

// Schema para a skill de adição de arquivo de memória
const AddMemoryFileSchema = z.object({
  content: z.string().min(1, 'O conteúdo não pode estar vazio.'),
  filename: z.string().optional(),
});

const MEMORY_DIR = path.join(process.cwd(), 'memory');

/**
 * Garante que o diretório de memória exista.
 */
async function ensureMemoryDirectory() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de memória:', error);
    throw new Error('Não foi possível criar o diretório de memória.');
  }
}

/**
 * Lê o conteúdo de um arquivo Markdown da pasta 'memory'.
 * @param params - Objeto contendo o nome do arquivo.
 * @returns O conteúdo do arquivo.
 */
export async function handleReadMemoryFile(params: { filename: string }) {
  const validated = ReadMemoryFileSchema.parse(params);
  const filePath = path.join(MEMORY_DIR, validated.filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, filename: validated.filename, content };
  } catch (error) {
    throw new Error(
      `Erro ao ler arquivo de memória ${validated.filename}: ${error}`,
    );
  }
}

/**
 * Adiciona um novo arquivo de memória.
 * @param params - Objeto contendo o conteúdo e, opcionalmente, o nome do arquivo.
 * @returns O nome do arquivo criado.
 */
export async function handleAddMemoryFile(params: {
  content: string;
  filename?: string;
}) {
  const validated = AddMemoryFileSchema.parse(params);
  await ensureMemoryDirectory();

  const filename =
    validated.filename ||
    `memory-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  const filePath = path.join(MEMORY_DIR, filename);

  try {
    await fs.writeFile(filePath, validated.content);
    return {
      success: true,
      filename,
      message: `Arquivo de memória '${filename}' criado com sucesso.`,
    };
  } catch (error) {
    throw new Error(`Erro ao criar arquivo de memória ${filename}: ${error}`);
  }
}

// Exportações para integração com o sistema de ferramentas
export const memoryManagerHandlers = {
  read_memory_file: handleReadMemoryFile,
  add_memory_file: handleAddMemoryFile,
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
  {
    name: 'add_memory_file',
    description:
      'Adiciona um novo arquivo de conhecimento na pasta de memória.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'O conteúdo a ser adicionado ao arquivo de memória.',
        },
        filename: {
          type: 'string',
          description: 'O nome opcional para o novo arquivo Markdown.',
        },
      },
      required: ['content'],
    },
  },
];
