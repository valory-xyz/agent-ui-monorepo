import { ThemeConfig, theme } from 'antd';

export const COLOR = {
  PRIMARY: '#2F54EB',
  SECONDARY: 'rgba(255, 255, 255, 0.5)',
  TEXT_PRIMARY: '#fff',
  BACKGROUND: '#2f1d57',

  BLACK_TRANSPARENT_3: 'rgba(0, 0, 0, 0.03)',
  BLACK_TRANSPARENT_20: 'rgba(0, 0, 0, 0.20)',
  BLACK_TRANSPARENT_30: 'rgba(0, 0, 0, 0.30)',
  BLACK_TRANSPARENT_50: 'rgba(0, 0, 0, 0.50)',

  WHITE_TRANSPARENT_5: 'rgba(255, 255, 255, 0.05)',
  WHITE_TRANSPARENT_10: 'rgba(255, 255, 255, 0.1)',
  WHITE_TRANSPARENT_20: 'rgba(255, 255, 255, 0.2)',
  WHITE_TRANSPARENT_50: 'rgba(255, 255, 255, 0.50)',
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
    Spin: {
      colorPrimary: COLOR.TEXT_PRIMARY,
    },
    Tag: {
      defaultBg: 'rgba(223, 229, 238, 0.1)',
      borderRadiusSM: 30,
      fontSizeSM: 16,
    },
    Timeline: {
      dotBorderWidth: 4,
      dotBg: COLOR.TEXT_PRIMARY,
      lineWidth: 4,
    },
    Button: {
      defaultBg: 'transparent',
      defaultHoverBg: COLOR.BLACK_TRANSPARENT_20,
      defaultBorderColor: COLOR.TEXT_PRIMARY,
    },
    Typography: {
      fontSize: 16,
    },
  },
  algorithm: theme.darkAlgorithm,
};
