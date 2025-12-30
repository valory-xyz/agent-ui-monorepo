import { GLOBAL_COLORS } from '@agent-ui-monorepo/ui-theme';
import { Badge, Flex } from 'antd';
import { CSSProperties, ReactNode } from 'react';

import { HaloDot } from './HaloDot';

const PILL_COLORS = {
  BLUE: '#1677FF',
  RED: '#F5222D',
  GRAY: '#FFFFFF',
};

const flexStyle: CSSProperties = { display: 'inline-flex', borderRadius: 40 };

type PillProps = {
  type?: 'primary' | 'danger' | 'neutral';
  size?: 'small' | 'large';
  style?: CSSProperties;
  children: ReactNode;
};

export type PillType = NonNullable<PillProps['type']>;

const PILL_STYLES: Record<PillType, { background: string; badgeColor: string; boxShadow: string }> =
  {
    primary: {
      background: GLOBAL_COLORS.BLUE_TRANSPARENT_10,
      badgeColor: PILL_COLORS.BLUE,
      boxShadow: `0px 0 10px ${PILL_COLORS.BLUE}20`,
    },
    danger: {
      background: GLOBAL_COLORS.RED_TRANSPARENT_20,
      badgeColor: PILL_COLORS.RED,
      boxShadow: `0px 0 10px ${PILL_COLORS.RED}20`,
    },
    neutral: {
      background: GLOBAL_COLORS.GRAY_TRANSPARENT_20,
      badgeColor: PILL_COLORS.GRAY,
      boxShadow: 'none',
    },
  };

const getSpacing = (size: 'small' | 'large', hasType: boolean) => ({
  gap: size === 'small' ? 4 : 8,
  padding: size === 'small' ? `2px 4px 2px ${hasType ? 16 : 8}px` : `6px 12px`,
  marginLeft: hasType ? -28 : 0,
});

export const Pill = ({ type = 'neutral', size = 'small', style, children }: PillProps) => {
  const { background, badgeColor, boxShadow } = PILL_STYLES[type];
  const spacing = getSpacing(size, !!type);

  return (
    <Flex
      align="center"
      gap={spacing.gap}
      style={{
        ...flexStyle,
        padding: spacing.padding,
        marginLeft: spacing.marginLeft,
        backgroundColor: background,
        ...style,
      }}
    >
      {type && (
        <Badge
          size="small"
          className={`ant-tag ant-tag-${type}`}
          color={badgeColor}
          style={{ display: 'none' }}
          styles={{ indicator: { width: 8, height: 8, boxShadow } }}
        />
      )}
      <Flex align="center" justify="center" gap={8}>
        <HaloDot dotColor={badgeColor} />
        {children}
      </Flex>
    </Flex>
  );
};
