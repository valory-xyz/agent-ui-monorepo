import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { Badge, Flex } from 'antd';
import { CSSProperties, ReactNode } from 'react';

import { COLOR } from '../../constants/theme';

type PillProps = {
  type?: 'primary' | 'danger' | 'neutral';
  size?: 'small' | 'large';
  style?: CSSProperties;
  children: ReactNode;
};

const getBackgroundColor = (type?: PillProps['type']) => {
  if (type === 'primary') return GLOBAL_COLORS.BLUE_TRANSPARENT_10;
  if (type === 'danger') return GLOBAL_COLORS.RED_TRANSPARENT_20;
  return GLOBAL_COLORS.GRAY_TRANSPARENT_20;
};

const getBadgeColor = (type?: PillProps['type']) => {
  if (type === 'primary') return COLOR.BLUE;
  if (type === 'danger') return COLOR.RED;
  return COLOR.TEXT_PRIMARY;
};

const getBoxShadow = (type?: PillProps['type']) => {
  if (type === 'primary') return `0px 0 10px ${COLOR.BLUE}20`;
  if (type === 'danger') return `0px 0 10px ${COLOR.RED}20`;
  return 'none';
};

// TODO: add a ui-pill nxx lib and move this there
export const Pill = ({ type, size = 'small', style, children }: PillProps) => {
  return (
    <Flex
      gap={size === 'small' ? 4 : 8}
      align="center"
      style={{
        display: 'inline-flex',
        padding: size === 'small' ? `2px 4px 2px ${type ? 16 : 8}px` : `6px 12px`,
        borderRadius: 40,
        marginLeft: type ? -28 : 0,
        backgroundColor: getBackgroundColor(type),
        ...(style || {}),
      }}
    >
      {type && (
        <Badge
          size="small"
          className={`ant-tag ant-tag-${type}`}
          color={getBadgeColor(type)}
          style={{ display: 'none' }}
          styles={{
            indicator: { width: 8, height: 8, boxShadow: getBoxShadow(type) },
          }}
        />
      )}
      {children}
    </Flex>
  );
};
