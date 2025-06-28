/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Tools Index
 *
 * Exporta todas as ferramentas organizadas por categoria - VERSÃO COMPLETA
 */

// Puppeteer Tools
export {
  puppeteerTools,
  handleNavigate,
  handleScreenshot,
  handleClick,
  handleType,
  handleFill,
  handleSelect,
  handleHover,
  handleEvaluate,
  handleGetContent,
  handleNewTab,
  // Fase 2: Navegação Avançada
  handleWaitForElement,
  handleScroll,
  handleGoBack,
  handleReload,
  // Fase 3: Extração Avançada
  handleGetText,
  handleGetAttribute,
  handleGetTitle,
  handleGetUrl,
  // Fase 4: Gestão de Abas
  handleListTabs,
  handleSwitchTab,
  handleCloseTab,
  handleDuplicateTab,
  // 🆕 Gestão de Chrome Persistente
  handleClosePersistentBrowser,
  handleGetBrowserStatus,
  startBrowserCleanup,
} from './puppeteer/index.js';

// Combinar todas as ferramentas
import { puppeteerTools } from './puppeteer/index.js';
import { agentsTools } from './agents/index.js';
import { memoryManagerTools } from '../agents/memory_manager_agent.js';

export const allTools = [
  ...puppeteerTools,
  ...agentsTools,
  ...memoryManagerTools,
];

// Mapa de handlers por nome da ferramenta
import {
  handleNavigate,
  handleScreenshot,
  handleClick,
  handleType,
  handleFill,
  handleSelect,
  handleHover,
  handleEvaluate,
  handleGetContent,
  handleNewTab,
  // Fase 2: Navegação Avançada
  handleWaitForElement,
  handleScroll,
  handleGoBack,
  handleReload,
  // Fase 3: Extração Avançada
  handleGetText,
  handleGetAttribute,
  handleGetTitle,
  handleGetUrl,
  // Fase 4: Gestão de Abas
  handleListTabs,
  handleSwitchTab,
  handleCloseTab,
  handleDuplicateTab,
  // 🆕 Gestão de Chrome Persistente
  handleClosePersistentBrowser,
  handleGetBrowserStatus,
} from './puppeteer/index.js';

import { agentsHandlers } from './agents/index.js';
import { memoryManagerHandlers } from '../agents/memory_manager_agent.js';

import { a2aHandlers } from './a2a/index.js';

export const toolHandlers = {
  // Básicos
  puppeteer_navigate: handleNavigate,
  puppeteer_screenshot: handleScreenshot,
  puppeteer_click: handleClick,
  puppeteer_type: handleType,
  puppeteer_get_content: handleGetContent,
  puppeteer_new_tab: handleNewTab,

  // Fase 1: Interação Avançada
  puppeteer_fill: handleFill,
  puppeteer_select: handleSelect,
  puppeteer_hover: handleHover,
  puppeteer_evaluate: handleEvaluate,

  // Fase 2: Navegação Avançada
  puppeteer_wait_for_element: handleWaitForElement,
  puppeteer_scroll: handleScroll,
  puppeteer_go_back: handleGoBack,
  puppeteer_reload: handleReload,

  // Fase 3: Extração Avançada
  puppeteer_get_text: handleGetText,
  puppeteer_get_attribute: handleGetAttribute,
  puppeteer_get_title: handleGetTitle,
  puppeteer_get_url: handleGetUrl,

  // Fase 4: Gestão de Abas
  puppeteer_list_tabs: handleListTabs,
  puppeteer_switch_tab: handleSwitchTab,
  puppeteer_close_tab: handleCloseTab,
  puppeteer_duplicate_tab: handleDuplicateTab,

  // 🆕 Gestão de Chrome Persistente
  puppeteer_close_persistent_browser: handleClosePersistentBrowser,
  puppeteer_get_browser_status: handleGetBrowserStatus,

  // Agentes
  ...agentsHandlers,
  ...memoryManagerHandlers,
  ...a2aHandlers,
} as const;
