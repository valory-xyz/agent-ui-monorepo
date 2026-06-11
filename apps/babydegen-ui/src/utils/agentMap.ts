/**
 * Supported agents map.
 * - modius: Modius agent (Mode chain)
 * - optimus: Optimus agent (Optimism chain)
 * - basius: Basius agent (Base chain)
 */
const env = process.env.REACT_APP_AGENT_NAME;

export const agentType = ((): 'modius' | 'basius' | 'optimus' => {
  if (env === 'modius') return 'modius';
  if (env === 'basius') return 'basius';
  return 'optimus';
})();

export const agentName = ((): 'Modius' | 'Basius' | 'Optimus' => {
  if (agentType === 'modius') return 'Modius';
  if (agentType === 'basius') return 'Basius';
  return 'Optimus';
})();

export const agentChainName = ((): 'mode' | 'base' | 'optimism' => {
  if (agentType === 'modius') return 'mode';
  if (agentType === 'basius') return 'base';
  return 'optimism';
})();
