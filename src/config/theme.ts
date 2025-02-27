import { ThemeConfig } from 'antd';

export const mainTheme: ThemeConfig = {
  token: {
    colorPrimary: '#C9ED29',
    colorWarning: '#FF9C27',
    colorTextBase: '#0F172A',
    colorText: '#0F172A',
    colorInfoText: '#36075F',
    colorTextSecondary: '#4D596A',
    fontSize: 14,
    lineHeight: 20 / 14,
    fontFamily: 'Inter',
  },
  components: {
    Alert: {
      fontSize: 16,
    },
    Button: {
      fontSize: 14,
      fontSizeLG: 16,
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      padding: 20,
      fontWeightStrong: 400,
      colorBorderSecondary: '#E4E4E4',
    },
    Input: {
      fontSize: 16,
      activeBorderColor: '#334155',
      hoverBorderColor: '#334155',
    },
    Table: {
      colorBgContainer: 'transparent',
      headerBg: 'transparent',
      rowHoverBg: 'transparent',
      padding: 8,
      fontSize: 14,
      fontWeightStrong: 500,
    },
    Tooltip: {
      fontSize: 14,
      colorText: 'black',
      colorTextLightSolid: 'black',
      colorBgSpotlight: 'white',
    },
    Typography: {
      colorText: '#1F2229',
      colorTextDescription: '#4D596A',
      colorTextSecondary: '#4D596A',
    },
    Popover: {
      fontSize: 14,
    },
    Tag: {
      colorSuccess: '#135200',
    },
  },
} as const;

// /* Pool */

// width: 260px;
// height: 20px;

// /* MD/Medium */
// font-family: 'Inter';
// font-style: normal;
// font-weight: 500;
// font-size: 14px;
// line-height: 20px;
// /* identical to box height, or 143% */

// color: #4D596A;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;
