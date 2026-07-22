import { ThemeConfig } from 'antd';

/**
 * Shared color tokens for connect-ui. Mirrors Pearl's design tokens
 * (olas-operate-app frontend/constants/colors.ts) — this Profile tab renders
 * inside Pearl's iframe, so buttons/inputs must match the host. Import `COLOR`
 * in styled-components instead of repeating hex values.
 */
export const COLOR = {
  // Brand
  PRIMARY: '#7E22CE',
  PRIMARY_HOVER: '#6A1CB1',
  PRIMARY_ACTIVE: '#5C1A9E',
  PRIMARY_DARK: '#36075F',

  WHITE: '#FFFFFF',
  BLACK: '#000000',

  // Text
  TEXT_PRIMARY: '#0F172A',
  TEXT_SECONDARY: '#363F49',
  TEXT_TERTIARY: '#617084',
  TEXT_TITLE: '#1F2229',

  // Borders & fills
  BORDER: '#DFE6EC',
  BORDER_LIGHT: '#EAEDF1',
  FILL_SECONDARY: '#E4E4E4',

  // Coding-tool select
  SELECT_BG: '#F2F4F9',
  SELECT_BG_HOVER: '#EDF2F7',
  SELECT_ARROW: '#4D596A',

  // Transaction-mode radio cards
  MODE_SELECTED_BORDER: '#ECDCF9',
  MODE_SELECTED_BG: '#F5EDFC',
  RADIO_BORDER: '#D9D9D9',

  // Info alert ("Unrestricted mode is on")
  INFO_BG: '#EBEDFF',
  INFO_BORDER: '#DBE0FF',
  INFO_ICON: '#4D63FF',
  INFO_TEXT: '#0016B2',

  // Modal backdrop
  MASK: 'rgba(15, 22, 36, 0.2)',
} as const;

export const mainTheme: ThemeConfig = {
  token: {
    colorPrimary: COLOR.PRIMARY,
    colorLink: COLOR.PRIMARY,
    colorText: COLOR.TEXT_PRIMARY,
    colorTextSecondary: COLOR.TEXT_SECONDARY,
    colorFillSecondary: COLOR.FILL_SECONDARY,
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
      controlHeight: 36,
      borderRadius: 10,
      fontSize: 16,
      fontSizeLG: 16,
      // For "primary" buttons
      colorPrimary: COLOR.PRIMARY,
      colorPrimaryHover: COLOR.PRIMARY_HOVER,
      colorPrimaryActive: COLOR.PRIMARY_ACTIVE,
      colorTextLightSolid: COLOR.WHITE,
      colorTextDisabled: COLOR.WHITE,
      // For "default" buttons
      colorText: COLOR.BLACK,
      colorBorder: COLOR.BORDER,
    },
    Divider: {
      // Section separators — 1px, rgba(223, 230, 236, 1)
      colorSplit: COLOR.BORDER,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 10,
      fontSize: 16,
    },
    Card: {
      padding: 20,
      fontWeightStrong: 400,
      borderRadiusLG: 10,
      colorBorderSecondary: COLOR.FILL_SECONDARY,
    },
    Input: {
      fontSize: 16,
      paddingBlock: 8,
      paddingInline: 8,
      colorBorder: COLOR.BORDER_LIGHT,
      hoverBorderColor: COLOR.BORDER,
    },
  },
} as const;
