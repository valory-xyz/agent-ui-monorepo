import { ThemeConfig } from 'antd';

/**
 * Mirrors Pearl's design tokens (olas-operate-app
 * frontend/constants/theme/theme.ts + constants/colors.ts) — this Profile tab
 * renders inside Pearl's iframe, so buttons/inputs must match the host.
 */
export const mainTheme: ThemeConfig = {
  token: {
    colorPrimary: '#7E22CE',
    colorLink: '#7E22CE',
    colorText: '#0F172A',
    colorTextSecondary: '#363F49',
    colorFillSecondary: '#E4E4E4',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeightStrong: 500,
  },
  components: {
    Alert: {
      fontSize: 16,
      fontSizeIcon: 16,
    },
    Button: {
      fontSize: 16,
      fontSizeLG: 16,
      // For "primary" buttons
      colorPrimary: '#7e22ce',
      colorPrimaryHover: '#6a1cb1',
      colorPrimaryActive: '#5c1a9e',
      colorTextLightSolid: '#ffffff',
      colorTextDisabled: '#ffffff',
      // For "default" buttons
      colorText: '#000000',
      colorBorder: '#dfe6ec',
    },
    Card: {
      padding: 20,
      fontWeightStrong: 400,
      borderRadiusLG: 10,
      colorBorderSecondary: '#E4E4E4',
    },
    Input: {
      fontSize: 16,
      paddingBlock: 8,
      paddingInline: 8,
      colorBorder: '#EAEDF1',
      hoverBorderColor: '#DFE6EC',
    },
  },
} as const;
