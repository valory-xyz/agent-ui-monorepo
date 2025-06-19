import { ThemeConfig } from 'antd';

export const COLOR = {
  PRIMARY: '#2F54EB',
  SECONDARY: '#4D596A',
  TEXT_PRIMARY: '#fff',
  BACKGROUND: '#2f1d57',
  WHITE: '#fff',
};

export const THEME_CONFIG: ThemeConfig = {
  token: {
    colorPrimary: COLOR.PRIMARY,
    colorTextSecondary: COLOR.SECONDARY,
    colorTextDescription: COLOR.SECONDARY,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Button: {
      defaultBorderColor: COLOR.TEXT_PRIMARY,
      fontSize: 16,
    },
    Typography: {
      fontSize: 16,
    },
  },
};
