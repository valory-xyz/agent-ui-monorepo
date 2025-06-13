import { ThemeConfig } from 'antd';

import { agentType } from '../utils/agentMap';

const modiusTheme: ThemeConfig['token'] = {
  colorPrimary: '#C9ED29',
  colorWarning: '#FF9C27',
};

const optimusTheme: ThemeConfig['token'] = {
  colorPrimary: '#FF0421',
  colorWarning: '#FF9C27',
};

export const mainTheme: ThemeConfig = {
  token: {
    ...(agentType === 'modius' ? modiusTheme : optimusTheme),
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
