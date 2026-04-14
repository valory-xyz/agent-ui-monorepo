import { AgentType } from '@agent-ui-monorepo/ui-chat';

/**
 * Supported agents map
 * - omenstrat_trader: Trader agent
 * - polystrat_trader: Polystrat agent
 */
const _name = process.env.REACT_APP_AGENT_NAME;

if (_name !== 'omenstrat_trader' && _name !== 'polystrat_trader') {
  console.warn(
    `Invalid REACT_APP_AGENT_NAME: "${_name}". Expected "omenstrat_trader" or "polystrat_trader". Defaulting to "omenstrat_trader".`,
  );
}

export const agentType: AgentType =
  _name === 'polystrat_trader' ? 'polystrat_trader' : 'omenstrat_trader';
export const isOmenstratAgent = agentType === 'omenstrat_trader';
export const isPolystratAgent = agentType === 'polystrat_trader';
