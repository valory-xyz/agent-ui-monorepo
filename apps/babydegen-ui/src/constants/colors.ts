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
};

const optimusColors = {
  blue: '#0D6EFD',
  danger: '#DC3545',
};

export const COLOR =
  agentType === 'modius'
    ? { ...modiusColors, ...commonColors }
    : { ...optimusColors, ...commonColors };
