import { ThemeConfig } from 'antd';

export const mainTheme: ThemeConfig = {
  token: {
    colorLink: '#7E22CE',
    colorPrimary: '#7E22CE',
    colorWarning: '#FF9C27',
    colorInfoText: '#36075F',
    colorText: '#0F172A',
    colorTextSecondary: '#4D596A',
    colorFillSecondary: '#E4E4E4',
    fontSize: 14,
    lineHeight: 20 / 14,
    fontFamily: 'Inter',
    colorBgContainer: '#FFFFFF',
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
      fontSize: 20,
      colorTextDisabled: '#334155',
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
};

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
