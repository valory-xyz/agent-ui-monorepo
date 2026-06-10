import { agentType } from '../agentMap';

const modiusPalette = ['#151515', '#DFFE00', '#44D299', '#1EBDD9', '#B0B0B0'];
const optimusPalette = ['#151515', '#FF0421', '#FF576A', '#FF94A0', '#FFC1C7', '#FFDDE1'];
// Basius (Base) donut palette — from design (dark → brand blue → tints).
const basiusPalette = ['#0C0D1D', '#0052FF', '#6689D4', '#9CADFF', '#A3AEBB', '#DFE5EE'];

export const piePalette = (() => {
  if (agentType === 'modius') return modiusPalette;
  if (agentType === 'basius') return basiusPalette;
  return optimusPalette;
})();
