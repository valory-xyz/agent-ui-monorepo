import { theme, ThemeConfig } from 'antd';

import { isOmenstratAgent } from '../utils/agentMap';

const traderColors = {
  PRIMARY: '#884dff',
  BACKGROUND: '#2f1d57',
  MODAL_BACKGROUND: '#2B194A',
  CARD_BACKGROUND: '#2B194A',
  TOOLTIP_BORDER: 'rgba(0, 0, 0, 0.90)',
};

const polystratColors = {
  PRIMARY: '#6B7280',
  BACKGROUND: '#192B3B',
  MODAL_BACKGROUND: '#2A4053',
  CARD_BACKGROUND: '#2A4053',
  TOOLTIP_BORDER: '#3D5266',
};

const agentColors = isOmenstratAgent ? traderColors : polystratColors;

export const COLOR = {
  PRIMARY: agentColors.PRIMARY,
  SECONDARY: 'rgba(255, 255, 255, 0.5)',
  TEXT_PRIMARY: '#FFFFFF',
  BACKGROUND: agentColors.BACKGROUND,
  MODAL_BACKGROUND: agentColors.MODAL_BACKGROUND,
  CARD_BACKGROUND: agentColors.CARD_BACKGROUND,
  TOOLTIP_BORDER: agentColors.TOOLTIP_BORDER,
  BORDER_NEUTRAL_SECONDARY: 'rgba(61, 82, 102, 0.50)',

  BLACK_TRANSPARENT_3: 'rgba(0, 0, 0, 0.03)',
  BLACK_TRANSPARENT_5: 'rgba(0, 0, 0, 0.05)',
  BLACK_TRANSPARENT_20: 'rgba(0, 0, 0, 0.20)',
  BLACK_TRANSPARENT_30: 'rgba(0, 0, 0, 0.30)',
  BLACK_TRANSPARENT_50: 'rgba(0, 0, 0, 0.50)',
  BLACK_TRANSPARENT_75: 'rgba(0, 0, 0, 0.75)',
  BLACK_BACKGROUND: 'rgba(0, 0, 0, 0.90)',

  WHITE_TRANSPARENT_05: 'rgba(255, 255, 255, 0.05)',
  WHITE_TRANSPARENT_10: 'rgba(255, 255, 255, 0.1)',
  WHITE_TRANSPARENT_20: 'rgba(255, 255, 255, 0.2)',
  WHITE_TRANSPARENT_50: 'rgba(255, 255, 255, 0.50)',
  WHITE_TRANSPARENT_75: 'rgba(255, 255, 255, 0.75)',

  PINK_BACKGROUND: 'rgba(255, 26, 114, 0.10)',
  PINK: '#FF4D91',

  GREEN_BACKGROUND: 'rgba(26, 255, 123, 0.10)',
  GREEN: '#1AFF7B',

  RED: '#F5222D',
  BLUE: '#1677FF',
  LIGHT_GRAY: '#F8F9FA',
};

export const THEME_CONFIG: ThemeConfig = {
  token: {
    colorLink: COLOR.TEXT_PRIMARY,
    colorText: COLOR.TEXT_PRIMARY,
    colorPrimary: COLOR.PRIMARY,
    colorTextSecondary: COLOR.SECONDARY,
    colorTextDescription: COLOR.SECONDARY,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Card: {
      borderRadiusLG: 16,
      fontSize: 16,
    },
    Spin: {
      colorPrimary: COLOR.TEXT_PRIMARY,
    },
    Timeline: {
      dotBorderWidth: 4,
      dotBg: COLOR.TEXT_PRIMARY,
      lineWidth: 4,
    },
    Button: {
      colorText: COLOR.TEXT_PRIMARY,
    },
    Pagination: {
      itemBg: 'transparent',
      itemActiveBg: COLOR.BORDER_NEUTRAL_SECONDARY,
      colorPrimary: COLOR.TEXT_PRIMARY,
      colorText: COLOR.WHITE_TRANSPARENT_50,
      colorTextDisabled: COLOR.WHITE_TRANSPARENT_50,
    },
    Typography: {
      fontSize: 16,
    },
    Tooltip: {
      paddingXS: 16,
      paddingSM: 24,
      colorBgSpotlight: isOmenstratAgent ? COLOR.BLACK_BACKGROUND : agentColors.BACKGROUND,
    },
    Segmented: {
      trackBg: COLOR.WHITE_TRANSPARENT_05,
      itemSelectedBg: COLOR.WHITE_TRANSPARENT_10,
    },
  },
  algorithm: theme.darkAlgorithm,
};
