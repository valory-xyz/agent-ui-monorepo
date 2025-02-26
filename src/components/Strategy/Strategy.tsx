import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Avatar,
  Card,
  Col,
  Flex,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { Pill } from '../../ui/Pill';

const { Title, Text } = Typography;

const mapTradingType = {
  risky: 'Risky',
  balanced: 'Balanced',
} as const;

const TradingStrategyTitle = () => (
  <Title level={5} style={{ marginBottom: 0, marginTop: 4 }} type="secondary">
    Trading strategy
    <Tooltip title="This is a dummy tooltip text">
      <InfoCircleOutlined style={{ marginLeft: 6 }} />
    </Tooltip>
  </Title>
);

const OperatingProtocolsTitle = () => (
  <Title level={5} style={{ marginBottom: 0, marginTop: 4 }} type="secondary">
    Operating protocols
    <Tooltip title="This is a dummy tooltip text">
      <InfoCircleOutlined style={{ marginLeft: 6 }} />
    </Tooltip>
  </Title>
);

const protocolImageMap = {
  balancerPool: '/logos/protocols/balancer.png',
  sturdy: '/logos/protocols/sturdy.png',
} as const;

export const Strategy = () => {
  const { isLoading, data } = usePortfolio();

  const operatingProtocols = useMemo(() => {
    if (!data?.selected_protocols) return;

    return data.selected_protocols.map((protocol: string) => (
      <Avatar key={protocol} size={32} src={protocolImageMap[protocol]} />
    ));
  }, [data.selected_protocols]);

  return (
    <Card className="card-gradient">
      <Row>
        <Col md={12} xs={24}>
          <Flex vertical gap={8} align="self-start">
            <TradingStrategyTitle />
            {isLoading ? (
              <Skeleton.Input style={{ width: 100 }} active size="small" />
            ) : (
              <Pill type="primary" size="large" style={{ marginLeft: 0 }}>
                {mapTradingType[data?.trading_type]}
              </Pill>
            )}
          </Flex>
        </Col>

        <Col md={12} xs={24}>
          <Flex vertical gap={8} align="self-start">
            <OperatingProtocolsTitle />
            {isLoading ? (
              <Skeleton.Input style={{ width: 100 }} active size="small" />
            ) : operatingProtocols.length === 0 ? (
              <Text type="secondary">No protocols</Text>
            ) : (
              <Flex gap={8} align="center">
                {operatingProtocols.map((protocol) => protocol)}
              </Flex>
            )}
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};
