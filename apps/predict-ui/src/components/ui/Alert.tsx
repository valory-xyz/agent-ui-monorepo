import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert as AntdAlert, Flex } from 'antd';
import { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';

type AlertType = 'warning' | 'error' | 'info';

type AlertProps = {
  type: AlertType;
  message: ReactNode;
  description?: ReactNode;
  style?: CSSProperties;
};

const ALERT_STYLES: Record<AlertType, { bg: string; border: string; color: string }> = {
  warning: { bg: COLOR.YELLOW_BACKGROUND, border: COLOR.YELLOW_BACKGROUND, color: COLOR.YELLOW },
  error: { bg: COLOR.RED_BACKGROUND, border: COLOR.RED_BACKGROUND, color: COLOR.RED },
  info: { bg: COLOR.INFO_BACKGROUND, border: COLOR.INFO_BORDER, color: COLOR.INFO },
};

const StyledAlert = styled(AntdAlert)<{ $alertType: AlertType }>`
  padding: 12px;
  align-items: flex-start;
  background: ${(props) => ALERT_STYLES[props.$alertType].bg};
  border-color: ${(props) => ALERT_STYLES[props.$alertType].border};
  color: ${(props) => ALERT_STYLES[props.$alertType].color};
`;

const ALERT_ICONS: Partial<Record<AlertType, ReactNode>> = {
  warning: <WarningOutlined style={{ fontSize: 18, marginTop: '2px', color: COLOR.YELLOW }} />,
  info: <InfoCircleOutlined style={{ fontSize: 18, marginTop: '2px', color: COLOR.INFO }} />,
};

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
      icon={ALERT_ICONS[type]}
      style={{ ...style }}
    />
  );
};
