import { WarningOutlined } from '@ant-design/icons';
import { Alert as AntdAlert, Flex } from 'antd';
import { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';

type AlertType = 'warning' | 'error';

type AlertProps = {
  type: AlertType;
  message: ReactNode;
  description?: ReactNode;
  style?: CSSProperties;
};

const StyledAlert = styled(AntdAlert)<{ $alertType: AlertType }>`
  padding: 12px;
  align-items: flex-start;
  background: ${(props) =>
    props.$alertType === 'warning' ? COLOR.YELLOW_BACKGROUND : COLOR.RED_BACKGROUND};
  border-color: ${(props) =>
    props.$alertType === 'warning' ? COLOR.YELLOW_BACKGROUND : COLOR.RED_BACKGROUND};
  color: ${(props) => (props.$alertType === 'warning' ? COLOR.YELLOW : COLOR.RED)};
`;

export const Alert = ({ type, message, description, style }: AlertProps) => {
  return (
    <StyledAlert
      $alertType={type}
      message={
        <Flex gap={8} vertical>
          <span style={{ fontWeight: 500 }}>{message}</span>
          {description && <span>{description}</span>}
        </Flex>
      }
      type={type}
      showIcon
      icon={
        type === 'warning' ? (
          <WarningOutlined style={{ fontSize: 18, marginTop: '2px', color: COLOR.YELLOW }} />
        ) : undefined
      }
      style={{ ...style }}
    />
  );
};
