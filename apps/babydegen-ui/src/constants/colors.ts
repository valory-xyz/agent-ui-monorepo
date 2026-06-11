import { agentType } from '../utils/agentMap';

const commonColors = {
  black: '#212529',
  darkGrey: '#343A40',
  mediumGrey: '#6C757D',
  grey: '#ADB5BD',
  lightGrey: '#CED4DA',
  white: '#FFFFFF',
};

const modiusColors = {
  blue: '#1677ff',
  danger: '#F5222D',
  buttonText: '#212529', // dark text — Modius primary button is light lime (#C9ED29)
};

const optimusColors = {
  blue: '#0D6EFD',
  danger: '#DC3545',
  buttonText: '#FFFFFF', // white text — Optimus primary button is red (#FF0421)
};

const basiusColors = {
  blue: '#0052FF',
  danger: '#FF1100',
  buttonText: '#FFFFFF', // white text — Basius primary button is blue (#0052FF)
};

export const COLOR = (() => {
  if (agentType === 'modius') return { ...modiusColors, ...commonColors };
  if (agentType === 'basius') return { ...basiusColors, ...commonColors };
  return { ...optimusColors, ...commonColors };
})();
