import { AgentType } from '@agent-ui-monorepo/ui-chat';

/**
 * Supported agents map
 * - omenstrat_trader: Trader agent
 * - polymarket_trader: Polystrat agent
 */
export const agentType: AgentType = (() => {
  const name = process.env.REACT_APP_AGENT_NAME;

  if (name === 'omenstrat_trader') {
    return 'omenstrat_trader';
  }

  if (name === 'polymarket_trader') {
    return 'polymarket_trader';
  }

  throw new Error(
    `Invalid REACT_APP_AGENT_NAME: "${name}". Expected "omenstrat_trader" or "polymarket_trader".`,
  );
})();
export const isOmenstratAgent = agentType === 'omenstrat_trader';
