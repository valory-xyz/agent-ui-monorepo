import { Badge, Flex } from 'antd';
import { CSSProperties, ReactNode } from 'react';

import { COLOR } from '../constants/colors';

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
        border: `1px solid ${COLOR.lightGrey}`,
        display: 'inline-flex',
        padding:
          size === 'small' ? `2px 4px 2px ${type ? 16 : 8}px` : `4px 16px 4px ${type ? 16 : 8}px`,
        borderRadius: 32,
        marginLeft: -28,
        backgroundColor: COLOR.white,
        ...(style || {}),
      }}
    >
      {type && (
        <Badge
          className={`ant-tag ant-tag-${type}`}
          color={type === 'primary' ? COLOR.blue : COLOR.danger}
          styles={{
            indicator: {
              width: 6,
              height: 6,
              boxShadow: `0px 0 0px 2px ${type === 'primary' ? COLOR.blue : COLOR.danger}40`,
            },
          }}
        />
      )}
      {children}
    </Flex>
  );
};
