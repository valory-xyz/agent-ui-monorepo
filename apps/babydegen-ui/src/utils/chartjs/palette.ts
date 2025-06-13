import { agentType } from '../agentMap';

const modiusPalette = ['#151515', '#DFFE00', '#44D299', '#1EBDD9', '#B0B0B0'];
const optimusPalette = [
  '#151515',
  '#FF0421',
  '#FF576A',
  '#FF94A0',
  '#FFC1C7',
  '#FFDDE1',
];

export const piePalette =
  agentType === 'modius' ? modiusPalette : optimusPalette;
