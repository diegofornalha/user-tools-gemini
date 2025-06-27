/**
 * Zod schemas for input validation
 */

import { z } from 'zod';

// ==================== Puppeteer Schemas ====================

export const NavigateSchema = z.object({
  url: z.string().url('URL deve ser válida'),
});

export const ScreenshotSchema = z.object({
  path: z.string().min(1, 'Path é obrigatório'),
  fullPage: z.boolean().optional().default(false),
});

export const ClickSchema = z.object({
  selector: z.string().min(1, 'Selector é obrigatório'),
});

export const TypeSchema = z.object({
  selector: z.string().min(1, 'Selector é obrigatório'),
  text: z.string().min(1, 'Text é obrigatório'),
});

// ==================== Schema Map ====================

import { ToolName } from './types.js';

export const ToolSchemas = {
  [ToolName.PUPPETEER_NAVIGATE]: NavigateSchema,
  [ToolName.PUPPETEER_SCREENSHOT]: ScreenshotSchema,
  [ToolName.PUPPETEER_CLICK]: ClickSchema,
  [ToolName.PUPPETEER_TYPE]: TypeSchema,
  [ToolName.PUPPETEER_GET_CONTENT]: z.object({}),
} as const;

// ==================== Validation Helper ====================

export function validateToolInput<T extends ToolName>(
  toolName: T,
  input: unknown,
): z.infer<(typeof ToolSchemas)[T]> {
  const schema = ToolSchemas[toolName];

  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`,
      );
      throw new Error(`Validação falhou:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

// ==================== Type Inference Helpers ====================

export type InferToolInput<T extends ToolName> = z.infer<
  (typeof ToolSchemas)[T]
>;
