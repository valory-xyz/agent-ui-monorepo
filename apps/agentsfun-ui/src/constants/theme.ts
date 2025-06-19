import { ThemeConfig } from 'antd';

export const COLOR = {
  PRIMARY: '#2F54EB',
  SECONDARY: '#4D596A',
  WHITE: '#fff',
};

export const THEME_CONFIG: ThemeConfig = {
  token: {
    colorPrimary: COLOR.PRIMARY,
    colorLink: COLOR.PRIMARY,
    colorTextSecondary: COLOR.SECONDARY,
    colorTextDescription: COLOR.SECONDARY,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Button: {
      fontSize: 16,
    },
    Typography: {
      fontSize: 16,
    },
  },
};
