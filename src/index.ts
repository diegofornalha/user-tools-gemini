#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * UserTools - MCP Server
 *
 * A Model Context Protocol server that provides diverse tools including
 * web automation through Puppeteer.
 *
 * @version 2.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Import all tools from the modular system
import { allTools, toolHandlers, startBrowserCleanup } from './tools/index.js';
import { MCPError, ErrorCode } from './types.js';
import { errorResponse } from './utils.js';

// Load environment variables
dotenv.config();

// ==================== Configuration ====================

const CONFIG = {
  server: {
    name: 'UserTools',
    version: '2.0.0',
    description: 'UserTools - MCP tools for web automation and more',
  },
} as const;

// ==================== Server State ====================

// Request count tracking could be added here if needed

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
    tools: allTools,
  };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return errorResponse(ErrorCode.INVALID_PARAMS, 'No arguments provided');
  }

  const handler = toolHandlers[name as keyof typeof toolHandlers];

  if (!handler) {
    return errorResponse(ErrorCode.NOT_FOUND, `Tool ${name} not found`);
  }

  try {
    // Execute handler
    const result = await handler(args as Record<string, unknown>);

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

// Start browser cleanup timer
startBrowserCleanup();

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  // console.error('Shutting down...');
  process.exit(0);
});

// ==================== Start Server ====================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Não logar nada no início para não interferir com o MCP
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
