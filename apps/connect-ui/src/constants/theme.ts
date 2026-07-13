import { ThemeConfig } from 'antd';

export const mainTheme: ThemeConfig = {
  token: {
    // Connect purple — approximated from Figma; swap for the exact token when available
    colorPrimary: '#7C3AED',
    colorTextBase: '#0F172A',
    colorText: '#0F172A',
    colorTextSecondary: '#4D596A',
    fontSize: 14,
    lineHeight: 20 / 14,
    fontFamily: 'Inter',
  },
  components: {
    Card: {
      padding: 20,
      fontWeightStrong: 400,
      borderRadius: 12,
      colorBorderSecondary: '#E4E4E4',
    },
    Typography: {
      colorText: '#1F2229',
      colorTextDescription: '#4D596A',
      colorTextSecondary: '#4D596A',
    },
  },
} as const;
