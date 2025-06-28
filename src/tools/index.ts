/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Tools Index
 *
 * Exporta todas as ferramentas organizadas por categoria
 */

// Puppeteer Tools
export {
  puppeteerTools,
  handleNavigate,
  handleScreenshot,
  handleClick,
  handleType,
  handleGetContent,
  startBrowserCleanup,
} from './puppeteer/index.js';

// Combinar todas as ferramentas
import { puppeteerTools } from './puppeteer/index.js';

export const allTools = [...puppeteerTools];

// Mapa de handlers por nome da ferramenta
import {
  handleNavigate,
  handleScreenshot,
  handleClick,
  handleType,
  handleGetContent,
} from './puppeteer/index.js';

export const toolHandlers = {
  // Puppeteer
  puppeteer_navigate: handleNavigate,
  puppeteer_screenshot: handleScreenshot,
  puppeteer_click: handleClick,
  puppeteer_type: handleType,
  puppeteer_get_content: handleGetContent,
} as const;
