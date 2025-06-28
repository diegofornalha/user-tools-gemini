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
  handleOpenBrowser,
  startBrowserCleanup,
} from './puppeteer/index.js';

// Browser Tools
export { browserTools, handleOpenUrl } from './browser/index.js';

// Combinar todas as ferramentas
import { puppeteerTools } from './puppeteer/index.js';
import { browserTools } from './browser/index.js';

export const allTools = [...puppeteerTools, ...browserTools];

// Mapa de handlers por nome da ferramenta
import {
  handleNavigate,
  handleScreenshot,
  handleClick,
  handleType,
  handleGetContent,
  handleOpenBrowser,
} from './puppeteer/index.js';

import { handleOpenUrl } from './browser/index.js';

export const toolHandlers = {
  // Puppeteer
  puppeteer_navigate: handleNavigate,
  puppeteer_screenshot: handleScreenshot,
  puppeteer_click: handleClick,
  puppeteer_type: handleType,
  puppeteer_get_content: handleGetContent,
  open_browser: handleOpenBrowser,

  // Browser
  browser_open_url: handleOpenUrl,
} as const;
