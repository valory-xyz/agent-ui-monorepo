import { Badge, Flex } from 'antd';
import React, { ReactNode } from 'react';

import { COLOR } from '../constants/colors';

type PillProps = {
  type?: 'primary' | 'danger';
  size?: 'small' | 'large';
  children: ReactNode;
  style?: React.CSSProperties;
};

export const Pill = ({ type, size = 'small', style, children }: PillProps) => {
  return (
    <Flex
      gap={size === 'small' ? 4 : 8}
      align="center"
      style={{
        border: '1px solid #DFE5EE',
        display: 'inline-flex',
        padding: size === 'small' ? '2px 4px' : '4px 16px',
        borderRadius: 32,
        marginLeft: -28,
        paddingRight: type ? 16 : 8,
        backgroundColor: 'white',
        ...(style || {}),
      }}
    >
      {type && (
        <Badge
          className={`ant-tag ant-tag-${type}`}
          color={type === 'primary' ? COLOR.primary : COLOR.danger}
          styles={{
            indicator: {
              width: 6,
              height: 6,
              boxShadow: `0px 0 0px 2px ${type === 'primary' ? COLOR.primary : COLOR.danger}40`,
            },
          }}
        />
      )}
      {children}
    </Flex>
  );
};
