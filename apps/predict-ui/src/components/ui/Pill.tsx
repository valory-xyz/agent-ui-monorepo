import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { Badge, Flex } from 'antd';
import { CSSProperties, ReactNode } from 'react';

import { COLOR } from '../../constants/theme';

type PillProps = {
  type?: 'primary' | 'danger';
  size?: 'small' | 'large';
  style?: CSSProperties;
  children: ReactNode;
};

// TODO: add a ui-pill nxx lib and move this there
export const Pill = ({ type, size = 'small', style, children }: PillProps) => {
  return (
    <Flex
      gap={size === 'small' ? 4 : 8}
      align="center"
      style={{
        display: 'inline-flex',
        padding:
          size === 'small' ? `2px 4px 2px ${type ? 16 : 8}px` : `6px 12px 6px ${type ? 12 : 6}px`,
        borderRadius: 40,
        marginLeft: -28,
        backgroundColor:
          type === 'primary' ? GLOBAL_COLORS.BLUE_TRANSPARENT_10 : GLOBAL_COLORS.RED_TRANSPARENT_20,
        ...(style || {}),
      }}
    >
      {type && (
        <Badge
          className={`ant-tag ant-tag-${type}`}
          color={type === 'primary' ? COLOR.BLUE : COLOR.RED}
          styles={{
            indicator: {
              width: 8,
              height: 8,
              boxShadow: `0px 0 0px 4px ${type === 'primary' ? COLOR.BLUE : COLOR.RED}40`,
            },
          }}
        />
      )}
      {children}
    </Flex>
  );
};
