import { ThemeConfig } from 'antd';

import { agentType } from '../utils/agentMap';

// TODO: move to colors instead
const modiusTheme: ThemeConfig['token'] = {
  colorPrimary: '#C9ED29',
};

// TODO: move to colors instead
const optimusTheme: ThemeConfig['token'] = {
  colorPrimary: '#FF0421',
};

export const mainTheme: ThemeConfig = {
  token: {
    ...(agentType === 'modius' ? modiusTheme : optimusTheme),
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
      padding: 20,
      fontWeightStrong: 400,
      borderRadius: 12,
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
