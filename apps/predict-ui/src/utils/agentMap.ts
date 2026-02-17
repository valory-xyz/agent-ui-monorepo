import { AgentType } from '@agent-ui-monorepo/ui-chat';

/**
 * Supported agents map
 * - omenstrat_trader: Trader agent
 * - polystrat_trader: Polystrat agent
 */
export const agentType: AgentType = (() => {
  const name = process.env.REACT_APP_AGENT_NAME;

  if (name === 'omenstrat_trader') {
    return 'omenstrat_trader';
  }

  if (name === 'polystrat_trader') {
    return 'polystrat_trader';
  }

  throw new Error(
    `Invalid REACT_APP_AGENT_NAME: "${name}". Expected "omenstrat_trader" or "polystrat_trader".`,
  );
})();
export const isOmenstratAgent = agentType === 'omenstrat_trader';
export const isPolystratAgent = agentType === 'polystrat_trader';
