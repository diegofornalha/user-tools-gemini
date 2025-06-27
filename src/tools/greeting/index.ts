/**
 * Greeting Tools Module
 *
 * Ferramentas para cumprimentar o usuário
 */

import { successResponse } from '../../utils.js';

export async function handleGreeting(params: { name: string }) {
  return successResponse(
    {},
    `Hello, ${params.name}! `,
  );
}

export const greetingTools = [
  {
    name: 'greeting',
    description: 'Cumprimenta o usuário',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'O nome a ser cumprimentado',
        },
      },
      required: ['name'],
    },
  },
];
