import { AgentType } from '@agent-ui-monorepo/ui-chat';

/**
 * Supported agents map
 * - omenstrat_trader: Trader agent
 * - polymarket_trader: Polystrat agent
 */
export const agentType: AgentType =
  process.env.REACT_APP_AGENT_NAME === 'omenstrat_trader'
    ? 'omenstrat_trader'
    : 'polymarket_trader';

export const isOmenstratAgent = agentType === 'omenstrat_trader';
