/**
 * Supported agents map.
 * - modius: Modius agent
 * - optimus: Optimus agent
 */
export const agentType =
  process.env.REACT_APP_AGENT_NAME === 'modius' ? 'modius' : 'optimus';

export const agentName = agentType === 'modius' ? 'Modius' : 'Optimus';

export const agentChainName = agentType === 'modius' ? 'mode' : 'optimism';
