import { SelectedProtocol } from '../types';

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

/**
 * Aerodrome (Base) is a Velodrome fork sharing the same contract ABIs, so the
 * agent backend reports it as `velodrome`. Basius runs only on Base, so display
 * that protocol as Aerodrome.
 */
export const normalizeProtocol = (protocol: SelectedProtocol): SelectedProtocol =>
  agentType === 'basius' && protocol === 'velodrome' ? 'aerodrome' : protocol;

/**
 * Backend-provided free-text detail strings (e.g. "Velodrome pool") reference
 * the reported protocol name. Relabel for Basius to match {@link normalizeProtocol}.
 */
export const normalizeDetails = (details: string): string =>
  agentType === 'basius' ? details.replace(/velodrome/gi, 'Aerodrome') : details;
