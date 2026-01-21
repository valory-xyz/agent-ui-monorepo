import { AgentType } from '@agent-ui-monorepo/ui-chat';

/**
 * Supported agents map.
 * - trader: Trader agent
 * - polymarket_trader: Polystrat agent
 */
export const agentType: AgentType =
  process.env.REACT_APP_AGENT_NAME === 'trader' ? 'trader' : 'polymarket_trader';

export const agentName = agentType === 'trader' ? 'Trader' : 'Polystrat';

export const agentChainName = agentType === 'trader' ? 'gnosis' : 'polygon';

export const isTraderAgent = agentType === 'trader';
