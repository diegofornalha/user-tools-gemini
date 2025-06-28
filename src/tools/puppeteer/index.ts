/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Puppeteer Tools Module
 *
 * Ferramentas de automação web usando Puppeteer
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { z } from 'zod';

import { successResponse } from '../../utils.js';
import {
  NavigateParams,
  ScreenshotParams,
  ClickParams,
  TypeParams,
  MCPError,
  ErrorCode,
} from '../../types.js';

// Schemas de validação
export const NavigateSchema = z.object({
  url: z.string().url('URL inválida fornecida'),
});

export const ScreenshotSchema = z.object({
  path: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  fullPage: z.boolean().optional().default(false),
});

export const ClickSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
});

export const TypeSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  text: z.string(),
});

// 🆕 Novos Schemas para ferramentas da imagem
export const FillSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  value: z.string(),
});

export const SelectSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  value: z.string().min(1, 'Valor para selecionar é obrigatório'),
});

export const HoverSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
});

export const EvaluateSchema = z.object({
  script: z.string().min(1, 'Script JavaScript é obrigatório'),
});

// Estado do browser
let browser: Browser | null = null;
let page: Page | null = null;
let lastActivity = Date.now();

// Configurações
const BROWSER_TIMEOUT = 5 * 60 * 1000; // 5 minutos
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

// Configurações do browser - simplificadas como no reference server
const BROWSER_CONFIG = {
  headless: false,
};

/**
 * Garante que o browser está inicializado
 */
async function ensureBrowser(): Promise<void> {
  if (!browser || !browser.isConnected()) {
    // Usa configuração simples como no reference server
    browser = await puppeteer.launch(BROWSER_CONFIG);

    // Adiciona listener para fechar gracefully
    browser.on('disconnected', () => {
      browser = null;
      page = null;
    });
  }

  if (!page || page.isClosed()) {
    const pages = await browser.pages();
    page = pages[0] || (await browser.newPage());
  }

  lastActivity = Date.now();
}

/**
 * Fecha o browser após inatividade
 */
export function startBrowserCleanup() {
  setInterval(async () => {
    if (browser && Date.now() - lastActivity > BROWSER_TIMEOUT) {
      await browser.close();
      browser = null;
      page = null;
    }
  }, 60000); // Verifica a cada minuto
}

// Handlers das ferramentas existentes
export async function handleNavigate(params: NavigateParams) {
  const validated = NavigateSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.goto(validated.url, { waitUntil: 'networkidle2' });

  return successResponse(
    { url: validated.url },
    `Navegado para ${validated.url}`,
  );
}

export async function handleScreenshot(params: ScreenshotParams) {
  const validated = ScreenshotSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  let path = validated.path;
  if (!path.match(/\.(png|jpg|jpeg)$/i)) {
    path += '.png';
  }

  await page.screenshot({
    path: path as any, // Type assertion necessária para compatibilidade com Puppeteer
    fullPage: validated.fullPage,
  });

  return successResponse({ path }, `Screenshot salvo em ${path}`);
}

export async function handleClick(params: ClickParams) {
  const validated = ClickSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.click(validated.selector);

  return successResponse(
    { selector: validated.selector },
    `Clicado no elemento: ${validated.selector}`,
  );
}

export async function handleType(params: TypeParams) {
  const validated = TypeSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.type(validated.selector, validated.text);

  return successResponse(
    { selector: validated.selector, text: validated.text },
    `Texto digitado no elemento: ${validated.selector}`,
  );
}

export async function handleGetContent() {
  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const content = await page.content();

  return successResponse({ content }, 'Conteúdo HTML obtido com sucesso');
}

export async function handleNewTab(params: NavigateParams) {
  const validated = NavigateSchema.parse(params);

  await ensureBrowser();
  if (!browser)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Browser não inicializado');

  // Cria nova aba
  const newPage = await browser.newPage();
  await newPage.setViewport(DEFAULT_VIEWPORT);
  await newPage.goto(validated.url, { waitUntil: 'networkidle2' });

  // Foca na nova aba
  await newPage.bringToFront();

  return successResponse(
    { url: validated.url },
    `Nova aba aberta com ${validated.url}`,
  );
}

// 🆕 Novos Handlers para ferramentas da imagem
export async function handleFill(params: { selector: string; value: string }) {
  const validated = FillSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  // Limpa campo antes de preencher
  await page.click(validated.selector, { clickCount: 3 });
  await page.type(validated.selector, validated.value);

  return successResponse(
    { selector: validated.selector, value: validated.value },
    `Campo preenchido: ${validated.selector} = "${validated.value}"`,
  );
}

export async function handleSelect(params: { selector: string; value: string }) {
  const validated = SelectSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.select(validated.selector, validated.value);

  return successResponse(
    { selector: validated.selector, value: validated.value },
    `Opção selecionada: ${validated.selector} = "${validated.value}"`,
  );
}

export async function handleHover(params: { selector: string }) {
  const validated = HoverSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.hover(validated.selector);

  return successResponse(
    { selector: validated.selector },
    `Hover realizado no elemento: ${validated.selector}`,
  );
}

export async function handleEvaluate(params: { script: string }) {
  const validated = EvaluateSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const result = await page.evaluate(validated.script);

  return successResponse(
    { script: validated.script, result },
    `JavaScript executado com sucesso`,
  );
}

// Metadados das ferramentas Puppeteer - Expandido
export const puppeteerTools = [
  {
    name: 'puppeteer_navigate',
    description: 'Navigate to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
      },
      required: ['url'],
    },
  },
  {
    name: 'puppeteer_screenshot',
    description: 'Take a screenshot of the current page',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to save the screenshot' },
        fullPage: {
          type: 'boolean',
          description: 'Capture full page',
          default: false,
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'puppeteer_click',
    description: 'Click on an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of element to click',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'puppeteer_type',
    description: 'Type text into an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element' },
        text: { type: 'string', description: 'Text to type' },
      },
      required: ['selector', 'text'],
    },
  },
  // 🆕 Nova ferramenta: Fill
  {
    name: 'puppeteer_fill',
    description: 'Fill an input field (clears first then types)',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of input field' },
        value: { type: 'string', description: 'Value to fill' },
      },
      required: ['selector', 'value'],
    },
  },
  // 🆕 Nova ferramenta: Select
  {
    name: 'puppeteer_select',
    description: 'Select an option from a dropdown',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of select element' },
        value: { type: 'string', description: 'Value to select' },
      },
      required: ['selector', 'value'],
    },
  },
  // 🆕 Nova ferramenta: Hover
  {
    name: 'puppeteer_hover',
    description: 'Hover over an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element to hover' },
      },
      required: ['selector'],
    },
  },
  // 🆕 Nova ferramenta: Evaluate
  {
    name: 'puppeteer_evaluate',
    description: 'Execute JavaScript code in the page context',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'JavaScript code to execute' },
      },
      required: ['script'],
    },
  },
  {
    name: 'puppeteer_get_content',
    description: 'Get the HTML content of the current page',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'puppeteer_new_tab',
    description: 'Open URL in a new browser tab',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open in new tab' },
      },
      required: ['url'],
    },
  },
];
