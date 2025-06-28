/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Puppeteer Tools Module
 *
 * Ferramentas de automação web usando Puppeteer - VERSÃO COMPLETA
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

// ================== SCHEMAS DE VALIDAÇÃO ==================

// Schemas básicos
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

// Schemas da Fase 1 (já implementados)
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

// 🆕 Schemas da Fase 2 - Navegação Avançada
export const WaitForElementSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  timeout: z.number().optional().default(30000),
  visible: z.boolean().optional().default(true),
});

export const ScrollSchema = z.object({
  direction: z.enum(['up', 'down', 'left', 'right']).optional().default('down'),
  amount: z.number().optional().default(500),
  selector: z.string().optional(), // Para scroll em elemento específico
});

export const ReloadSchema = z.object({
  waitUntil: z
    .enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2'])
    .optional()
    .default('networkidle2'),
});

// 🆕 Schemas da Fase 3 - Extração Avançada
export const GetTextSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  trim: z.boolean().optional().default(true),
});

export const GetAttributeSchema = z.object({
  selector: z.string().min(1, 'Seletor CSS é obrigatório'),
  attribute: z.string().min(1, 'Nome do atributo é obrigatório'),
});

// 🆕 Schemas da Fase 4 - Gestão de Abas
export const SwitchTabSchema = z.object({
  tabIndex: z.number().min(0, 'Índice da aba deve ser >= 0'),
});

export const CloseTabSchema = z.object({
  tabIndex: z.number().optional(), // Se não fornecido, fecha aba atual
});

// ================== ESTADO DO BROWSER ==================

let browser: Browser | null = null;
let page: Page | null = null;
let pages: Page[] = [];
let lastActivity = Date.now();

// Configurações para página persistente
const BROWSER_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas (página persistente)
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

// 🆕 Configuração para Chrome persistente
const BROWSER_CONFIG = {
  headless: false,
  // 🆕 Conectar a instância existente ou criar nova
  executablePath: undefined, // Usa Chrome padrão do sistema
  userDataDir: './chrome-user-data', // 🆕 Diretório persistente de dados
  args: [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-default-apps',
    '--disable-popup-blocking',
    '--disable-translate',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-ipc-flooding-protection',
    '--remote-debugging-port=9222', // 🆕 Porta para reconexão
  ],
  defaultViewport: DEFAULT_VIEWPORT,
  // 🆕 Não fechar ao terminar processo
  handleSIGINT: false,
  handleSIGTERM: false,
  handleSIGHUP: false,
};

/**
 * 🆕 Tenta conectar a uma instância existente do Chrome
 */
async function tryConnectToExistingBrowser(): Promise<Browser | null> {
  try {
    // Tenta conectar ao Chrome na porta 9222
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: DEFAULT_VIEWPORT,
    });

    console.log('✅ Conectado ao Chrome existente na porta 9222');
    return browser;
  } catch (_error) {
    console.log('ℹ️ Nenhuma instância do Chrome encontrada, criando nova...');
    return null;
  }
}

/**
 * Garante que o browser está inicializado e atualiza lista de páginas
 * 🆕 Com suporte a reconexão automática
 */
async function ensureBrowser(): Promise<void> {
  if (!browser || !browser.isConnected()) {
    // 🆕 Primeira tentativa: conectar ao Chrome existente
    browser = await tryConnectToExistingBrowser();

    // Se não conseguiu conectar, cria nova instância
    if (!browser) {
      browser = await puppeteer.launch(BROWSER_CONFIG);
      console.log('🚀 Nova instância do Chrome iniciada na porta 9222');
    }

    browser.on('disconnected', () => {
      console.log(
        '⚠️ Chrome desconectado, tentará reconectar na próxima operação',
      );
      browser = null;
      page = null;
      pages = [];
    });
  }

  // Atualiza lista de páginas
  pages = await browser.pages();

  if (!page || page.isClosed()) {
    page = pages[0] || (await browser.newPage());
    await page.setViewport(DEFAULT_VIEWPORT);
  }

  lastActivity = Date.now();
}

/**
 * 🆕 Função de cleanup modificada para página persistente
 * Agora apenas monitora, não fecha automaticamente
 */
export function startBrowserCleanup() {
  setInterval(async () => {
    if (browser && Date.now() - lastActivity > BROWSER_TIMEOUT) {
      console.log(
        'ℹ️ Chrome inativo há 24h, mas mantendo aberto (página persistente)',
      );
      // 🆕 NÃO fecha o browser automaticamente
      // await browser.close(); // ❌ Removido
      // browser = null;        // ❌ Removido
      // page = null;           // ❌ Removido
      // pages = [];            // ❌ Removido
    }
  }, 60000);
}

/**
 * 🆕 Função para fechar manualmente o Chrome persistente (quando necessário)
 */
export async function closePersistentBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    pages = [];
    console.log('🔴 Chrome persistente fechado manualmente');
  }
}

// ================== HANDLERS - BÁSICOS ==================

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
    path: path as string,
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

  const newPage = await browser.newPage();
  await newPage.setViewport(DEFAULT_VIEWPORT);
  await newPage.goto(validated.url, { waitUntil: 'networkidle2' });
  await newPage.bringToFront();

  // Atualiza página atual e lista
  page = newPage;
  pages = await browser.pages();

  return successResponse(
    { url: validated.url, tabIndex: pages.length - 1 },
    `Nova aba aberta com ${validated.url}`,
  );
}

// ================== HANDLERS - FASE 1 ==================

export async function handleFill(params: { selector: string; value: string }) {
  const validated = FillSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.click(validated.selector, { clickCount: 3 });
  await page.type(validated.selector, validated.value);

  return successResponse(
    { selector: validated.selector, value: validated.value },
    `Campo preenchido: ${validated.selector} = "${validated.value}"`,
  );
}

export async function handleSelect(params: {
  selector: string;
  value: string;
}) {
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

  const result: unknown = await page.evaluate(validated.script);

  return successResponse(
    { script: validated.script, result },
    `JavaScript executado com sucesso`,
  );
}

// ================== HANDLERS - FASE 2: NAVEGAÇÃO AVANÇADA ==================

export async function handleWaitForElement(params: {
  selector: string;
  timeout?: number;
  visible?: boolean;
}) {
  const validated = WaitForElementSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.waitForSelector(validated.selector, {
    timeout: validated.timeout,
    visible: validated.visible,
  });

  return successResponse(
    { selector: validated.selector, timeout: validated.timeout },
    `Elemento encontrado: ${validated.selector}`,
  );
}

export async function handleScroll(params: {
  direction?: string;
  amount?: number;
  selector?: string;
}) {
  const validated = ScrollSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  if (validated.selector) {
    // Scroll em elemento específico
    await page.evaluate(
      (selector, direction, amount) => {
        const element = document.querySelector(selector);
        if (element) {
          switch (direction) {
            case 'up':
              element.scrollTop -= amount;
              break;
            case 'down':
              element.scrollTop += amount;
              break;
            case 'left':
              element.scrollLeft -= amount;
              break;
            case 'right':
              element.scrollLeft += amount;
              break;
          }
        }
      },
      validated.selector,
      validated.direction,
      validated.amount,
    );
  } else {
    // Scroll da página
    await page.evaluate(
      (direction, amount) => {
        switch (direction) {
          case 'up':
            window.scrollBy(0, -amount);
            break;
          case 'down':
            window.scrollBy(0, amount);
            break;
          case 'left':
            window.scrollBy(-amount, 0);
            break;
          case 'right':
            window.scrollBy(amount, 0);
            break;
        }
      },
      validated.direction,
      validated.amount,
    );
  }

  return successResponse(
    {
      direction: validated.direction,
      amount: validated.amount,
      selector: validated.selector,
    },
    `Scroll realizado: ${validated.direction} (${validated.amount}px)`,
  );
}

export async function handleGoBack() {
  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.goBack({ waitUntil: 'networkidle2' });
  const url = page.url();

  return successResponse({ url }, `Voltou para página anterior: ${url}`);
}

export async function handleReload(params: { waitUntil?: string } = {}) {
  const validated = ReloadSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  await page.reload({ waitUntil: validated.waitUntil });
  const url = page.url();

  return successResponse(
    { url, waitUntil: validated.waitUntil },
    `Página recarregada: ${url}`,
  );
}

// ================== HANDLERS - FASE 3: EXTRAÇÃO AVANÇADA ==================

export async function handleGetText(params: {
  selector: string;
  trim?: boolean;
}) {
  const validated = GetTextSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const element = await page.$(validated.selector);
  if (!element) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Elemento não encontrado: ${validated.selector}`,
    );
  }

  let text = await element.evaluate((el) => el.textContent);
  if (validated.trim && text) {
    text = text.trim();
  }

  return successResponse(
    { selector: validated.selector, text, trim: validated.trim },
    `Texto extraído de ${validated.selector}`,
  );
}

export async function handleGetAttribute(params: {
  selector: string;
  attribute: string;
}) {
  const validated = GetAttributeSchema.parse(params);

  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const element = await page.$(validated.selector);
  if (!element) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Elemento não encontrado: ${validated.selector}`,
    );
  }

  const value = await element.evaluate(
    (el, attr) => el.getAttribute(attr),
    validated.attribute,
  );

  return successResponse(
    { selector: validated.selector, attribute: validated.attribute, value },
    `Atributo ${validated.attribute} extraído de ${validated.selector}`,
  );
}

export async function handleGetTitle() {
  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const title = await page.title();

  return successResponse({ title }, `Título da página: ${title}`);
}

export async function handleGetUrl() {
  await ensureBrowser();
  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const url = page.url();

  return successResponse({ url }, `URL atual: ${url}`);
}

// ================== HANDLERS - FASE 4: GESTÃO DE ABAS ==================

export async function handleListTabs() {
  await ensureBrowser();
  if (!browser)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Browser não inicializado');

  pages = await browser.pages();

  const tabs = await Promise.all(
    pages.map(async (p, index) => ({
      index,
      url: p.url(),
      title: await p.title(),
      active: p === page,
    })),
  );

  return successResponse(
    { tabs, count: tabs.length },
    `${tabs.length} abas abertas`,
  );
}

export async function handleSwitchTab(params: { tabIndex: number }) {
  const validated = SwitchTabSchema.parse(params);

  await ensureBrowser();
  if (!browser)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Browser não inicializado');

  pages = await browser.pages();

  if (validated.tabIndex >= pages.length) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Aba ${validated.tabIndex} não existe. Total: ${pages.length}`,
    );
  }

  const targetPage = pages[validated.tabIndex];
  if (!targetPage) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Aba ${validated.tabIndex} não encontrada`,
    );
  }

  page = targetPage;
  await page.bringToFront();

  return successResponse(
    {
      tabIndex: validated.tabIndex,
      url: page.url(),
      title: await page.title(),
    },
    `Alternado para aba ${validated.tabIndex}`,
  );
}

export async function handleCloseTab(params: { tabIndex?: number } = {}) {
  const validated = CloseTabSchema.parse(params);

  await ensureBrowser();
  if (!browser)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Browser não inicializado');

  pages = await browser.pages();

  let targetPage: Page;
  let targetIndex: number;

  if (validated.tabIndex !== undefined) {
    if (validated.tabIndex >= pages.length) {
      throw new MCPError(
        ErrorCode.INTERNAL_ERROR,
        `Aba ${validated.tabIndex} não existe. Total: ${pages.length}`,
      );
    }
    const selectedPage = pages[validated.tabIndex];
    if (!selectedPage) {
      throw new MCPError(
        ErrorCode.INTERNAL_ERROR,
        `Aba ${validated.tabIndex} não encontrada`,
      );
    }
    targetPage = selectedPage;
    targetIndex = validated.tabIndex;
  } else {
    if (!page) {
      throw new MCPError(
        ErrorCode.PAGE_LOAD_FAILED,
        'Nenhuma aba ativa para fechar',
      );
    }
    targetPage = page;
    targetIndex = pages.indexOf(page);
  }

  await targetPage.close();

  // Atualiza lista e página atual
  pages = await browser.pages();
  if (pages.length > 0) {
    const newPage = pages[Math.min(targetIndex, pages.length - 1)];
    if (newPage) {
      page = newPage;
      await page.bringToFront();
    } else {
      page = null;
    }
  } else {
    page = null;
  }

  return successResponse(
    { closedTabIndex: targetIndex, remainingTabs: pages.length },
    `Aba ${targetIndex} fechada. ${pages.length} abas restantes`,
  );
}

export async function handleDuplicateTab() {
  await ensureBrowser();
  if (!browser)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Browser não inicializado');

  if (!page)
    throw new MCPError(ErrorCode.PAGE_LOAD_FAILED, 'Página não inicializada');

  const currentUrl = page.url();
  const newPage = await browser.newPage();
  await newPage.setViewport(DEFAULT_VIEWPORT);
  await newPage.goto(currentUrl, { waitUntil: 'networkidle2' });
  await newPage.bringToFront();

  // Atualiza lista de páginas
  pages = await browser.pages();
  page = newPage;

  return successResponse(
    { url: currentUrl, tabIndex: pages.length - 1 },
    `Aba duplicada: ${currentUrl}`,
  );
}

// 🆕 HANDLER PARA GERENCIAR CHROME PERSISTENTE

export async function handleClosePersistentBrowser() {
  await closePersistentBrowser();

  return successResponse(
    { action: 'browser_closed' },
    'Chrome persistente fechado manualmente',
  );
}

export async function handleGetBrowserStatus() {
  const isConnected = browser?.isConnected() ?? false;
  const totalPages = pages.length;
  const currentUrl = page?.url() ?? 'Nenhuma página ativa';
  const uptime = Date.now() - lastActivity;

  return successResponse(
    {
      connected: isConnected,
      totalPages,
      currentUrl,
      uptimeMs: uptime,
      uptimeFormatted: formatUptime(uptime),
      persistentMode: true,
    },
    `Chrome ${isConnected ? 'conectado' : 'desconectado'} - ${totalPages} abas abertas`,
  );
}

/**
 * 🆕 Formatar tempo de atividade
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ================== METADADOS DAS FERRAMENTAS ==================

export const puppeteerTools = [
  // BÁSICAS
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
  {
    name: 'puppeteer_get_content',
    description: 'Get the HTML content of the current page',
    inputSchema: { type: 'object', properties: {} },
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

  // FASE 1: INTERAÇÃO AVANÇADA
  {
    name: 'puppeteer_fill',
    description: 'Fill an input field (clears first then types)',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of input field',
        },
        value: { type: 'string', description: 'Value to fill' },
      },
      required: ['selector', 'value'],
    },
  },
  {
    name: 'puppeteer_select',
    description: 'Select an option from a dropdown',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of select element',
        },
        value: { type: 'string', description: 'Value to select' },
      },
      required: ['selector', 'value'],
    },
  },
  {
    name: 'puppeteer_hover',
    description: 'Hover over an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of element to hover',
        },
      },
      required: ['selector'],
    },
  },
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

  // FASE 2: NAVEGAÇÃO AVANÇADA
  {
    name: 'puppeteer_wait_for_element',
    description: 'Wait for an element to appear on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector to wait for' },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          default: 30000,
        },
        visible: {
          type: 'boolean',
          description: 'Wait for element to be visible',
          default: true,
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'puppeteer_scroll',
    description: 'Scroll the page or a specific element',
    inputSchema: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['up', 'down', 'left', 'right'],
          description: 'Scroll direction',
          default: 'down',
        },
        amount: {
          type: 'number',
          description: 'Amount to scroll in pixels',
          default: 500,
        },
        selector: {
          type: 'string',
          description: 'CSS selector of element to scroll (optional)',
        },
      },
    },
  },
  {
    name: 'puppeteer_go_back',
    description: 'Go back to the previous page',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'puppeteer_reload',
    description: 'Reload the current page',
    inputSchema: {
      type: 'object',
      properties: {
        waitUntil: {
          type: 'string',
          enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
          description: 'When to consider reload complete',
          default: 'networkidle2',
        },
      },
    },
  },

  // FASE 3: EXTRAÇÃO AVANÇADA
  {
    name: 'puppeteer_get_text',
    description: 'Get text content from an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element' },
        trim: {
          type: 'boolean',
          description: 'Trim whitespace',
          default: true,
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'puppeteer_get_attribute',
    description: 'Get an attribute value from an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element' },
        attribute: { type: 'string', description: 'Attribute name to get' },
      },
      required: ['selector', 'attribute'],
    },
  },
  {
    name: 'puppeteer_get_title',
    description: 'Get the title of the current page',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'puppeteer_get_url',
    description: 'Get the URL of the current page',
    inputSchema: { type: 'object', properties: {} },
  },

  // FASE 4: GESTÃO DE ABAS
  {
    name: 'puppeteer_list_tabs',
    description: 'List all open browser tabs',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'puppeteer_switch_tab',
    description: 'Switch to a specific tab by index',
    inputSchema: {
      type: 'object',
      properties: {
        tabIndex: {
          type: 'number',
          description: 'Index of tab to switch to (0-based)',
        },
      },
      required: ['tabIndex'],
    },
  },
  {
    name: 'puppeteer_close_tab',
    description: 'Close a specific tab or current tab',
    inputSchema: {
      type: 'object',
      properties: {
        tabIndex: {
          type: 'number',
          description:
            'Index of tab to close (optional, defaults to current tab)',
        },
      },
    },
  },
  {
    name: 'puppeteer_duplicate_tab',
    description: 'Duplicate the current tab',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'puppeteer_close_persistent_browser',
    description: 'Close the persistent browser',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'puppeteer_get_browser_status',
    description: 'Get the status of the persistent browser',
    inputSchema: { type: 'object', properties: {} },
  },
];
