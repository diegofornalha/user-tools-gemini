#!/usr/bin/env node

/**
 * UserTools - MCP Server
 *
 * A Model Context Protocol server that provides diverse tools including
 * web automation through Puppeteer.
 *
 * @version 2.0.0
 * @license MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Lazy loading de dependências pesadas
let puppeteer: any;

// Import custom types and utilities
import {
  ToolName,
  ServerState,
  MCPError,
  ErrorCode,
  NavigateParams,
  ScreenshotParams,
  ClickParams,
  TypeParams,
} from './types.js';

import { validateToolInput } from './schemas.js';
import { withTimeout, successResponse, errorResponse } from './utils.js';

// Load environment variables
dotenv.config();

// ==================== Configuration ====================

const CONFIG = {
  puppeteer: {
    headless: false,
    defaultTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
  server: {
    name: 'UserTools',
    version: '2.0.0',
    description: 'UserTools - MCP tools for web automation',
  },
} as const;

// ==================== Server State ====================

const state: ServerState = {
  browser: undefined,
  page: undefined,
  lastActivity: Date.now(),
  requestCount: 0,
};

// ==================== Helper Functions ====================

/**
 * Ensures the Puppeteer browser and page are initialized
 * @returns Browser and page instances
 * @throws {MCPError} If browser initialization fails
 */
async function ensureBrowser(): Promise<{ browser: any; page: any }> {
  try {
    // Lazy load puppeteer apenas quando necessário
    if (!puppeteer) {
      const puppeteerModule = await import('puppeteer');
      puppeteer = puppeteerModule.default;
    }

    if (!state.browser || !(state.browser as any).isConnected()) {
      state.browser = await puppeteer.launch({
        headless: CONFIG.puppeteer.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      state.page = await (state.browser as any).newPage();

      // Set viewport
      await (state.page as any).setViewport({
        width: CONFIG.puppeteer.viewportWidth,
        height: CONFIG.puppeteer.viewportHeight,
      });

      // Set default timeout
      (state.page as any).setDefaultTimeout(CONFIG.puppeteer.defaultTimeout);
    }

    if (!state.page || (state.page as any).isClosed()) {
      state.page = await (state.browser as any).newPage();
    }

    state.lastActivity = Date.now();
    return { browser: state.browser, page: state.page };
  } catch (error) {
    throw new MCPError(
      ErrorCode.BROWSER_NOT_INITIALIZED,
      'Failed to initialize browser',
      error,
    );
  }
}

// ==================== Tool Handlers ====================

/**
 * Navigate to a URL
 * @param params Navigation parameters
 * @returns Success response with navigation confirmation
 */
async function handleNavigate(params: NavigateParams) {
  const { page } = await ensureBrowser();

  await withTimeout(
    async () => {
      await page.goto(params.url, { waitUntil: 'networkidle2' });
    },
    CONFIG.puppeteer.defaultTimeout,
    `Navigation to ${params.url} timed out`,
  );

  return successResponse(null, `Navigated to ${params.url}`);
}

/**
 * Take a screenshot of the current page
 * @param params Screenshot parameters
 * @returns Success response with file path
 */
async function handleScreenshot(params: ScreenshotParams) {
  const { page } = await ensureBrowser();

  // Ensure proper file extension
  let path = params.path;
  if (!path.match(/\.(png|jpg|jpeg|webp)$/i)) {
    path = `${path}.png`;
  }

  await page.screenshot({
    path: path as any,
    fullPage: params.fullPage,
  });

  return successResponse({ path }, `Screenshot saved to ${path}`);
}

/**
 * Click on an element
 * @param params Click parameters
 * @returns Success response with confirmation
 */
async function handleClick(params: ClickParams) {
  const { page } = await ensureBrowser();

  await withTimeout(
    async () => {
      await page.waitForSelector(params.selector, { visible: true });
      await page.click(params.selector);
    },
    5000,
    `Element ${params.selector} not found or not clickable`,
  );

  return successResponse(null, `Clicked on element: ${params.selector}`);
}

/**
 * Type text into an element
 * @param params Type parameters
 * @returns Success response with confirmation
 */
async function handleType(params: TypeParams) {
  const { page } = await ensureBrowser();

  await withTimeout(
    async () => {
      await page.waitForSelector(params.selector, { visible: true });
      await page.type(params.selector, params.text);
    },
    5000,
    `Element ${params.selector} not found`,
  );

  return successResponse(null, `Typed text into element: ${params.selector}`);
}

/**
 * Get the HTML content of the current page
 * @returns Success response with page content
 */
async function handleGetContent() {
  const { page } = await ensureBrowser();
  const content = await page.content();
  return successResponse(content);
}

// ==================== Tool Registry ====================

const toolHandlers: Record<ToolName, (args: any) => Promise<any>> = {
  [ToolName.PUPPETEER_NAVIGATE]: handleNavigate,
  [ToolName.PUPPETEER_SCREENSHOT]: handleScreenshot,
  [ToolName.PUPPETEER_CLICK]: handleClick,
  [ToolName.PUPPETEER_TYPE]: handleType,
  [ToolName.PUPPETEER_GET_CONTENT]: handleGetContent,
};

// ==================== Server Setup ====================

const server = new Server(CONFIG.server, {
  capabilities: {
    tools: {},
  },
});

/**
 * Handle tool list requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Puppeteer tools
      {
        name: ToolName.PUPPETEER_NAVIGATE,
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
        name: ToolName.PUPPETEER_SCREENSHOT,
        description: 'Take a screenshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to save the screenshot',
            },
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
        name: ToolName.PUPPETEER_CLICK,
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
        name: ToolName.PUPPETEER_TYPE,
        description: 'Type text into an element',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector of element',
            },
            text: { type: 'string', description: 'Text to type' },
          },
          required: ['selector', 'text'],
        },
      },
      {
        name: ToolName.PUPPETEER_GET_CONTENT,
        description: 'Get the HTML content of the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  state.requestCount++;

  if (!args) {
    return errorResponse(ErrorCode.INVALID_PARAMS, 'No arguments provided');
  }

  const toolName = name as ToolName;
  const handler = toolHandlers[toolName];

  if (!handler) {
    return errorResponse(ErrorCode.NOT_FOUND, `Tool ${name} not found`);
  }

  try {
    // Validate input
    const validatedArgs = validateToolInput(toolName, args);

    // Execute handler
    const result = await handler(validatedArgs);

    // Ensure we return the expected format
    if (!result.content) {
      result.content = [];
    }

    return result;
  } catch (error) {
    if (error instanceof MCPError) {
      return errorResponse(error.code, error.message, error.details);
    }

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(ErrorCode.UNKNOWN, message);
  }
});

// ==================== Cleanup and Resource Management ====================

/**
 * Cleanup browser resources after inactivity
 */
setInterval(async () => {
  const inactivityTimeout = 5 * 60 * 1000; // 5 minutes

  if (state.browser && Date.now() - state.lastActivity > inactivityTimeout) {
    try {
      await state.browser.close();
      state.browser = undefined;
      state.page = undefined;
      // console.error('Browser closed due to inactivity');
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}, 60000); // Check every minute

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  // console.error('Shutting down...');

  if (state.browser) {
    await state.browser.close();
  }

  process.exit(0);
});

// ==================== Start Server ====================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Não logar nada no início para não interferir com o MCP
  // console.error(`${CONFIG.server.name} v${CONFIG.server.version} started`);
  // console.error(`Total requests processed: ${state.requestCount}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
