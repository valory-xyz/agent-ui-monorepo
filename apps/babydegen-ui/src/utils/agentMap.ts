/**
 * Supported agents map.
 * - modius: Modius agent (Mode chain)
 * - optimus: Optimus agent (Optimism chain)
 * - basius: Basius agent (Base chain)
 */
const env = process.env.REACT_APP_AGENT_NAME;

export const agentType = env === 'modius' ? 'modius' : env === 'basius' ? 'basius' : 'optimus';

export const agentName =
  agentType === 'modius' ? 'Modius' : agentType === 'basius' ? 'Basius' : 'Optimus';

export const agentChainName =
  agentType === 'modius' ? 'mode' : agentType === 'basius' ? 'base' : 'optimism';
