import { Card, Flex, Typography } from 'antd';
import React from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { Pill } from '../../ui/Pill';

const { Title } = Typography;

const mapTradingType = {
  risky: 'Risky',
  balanced: 'Balanced',
};

export const Strategy = () => {
  const { data } = usePortfolio();

  return (
    <Card className="card-gradient">
      <Flex vertical gap={8} align="self-start">
        <Title
          level={5}
          style={{ marginBottom: 0, marginTop: 4 }}
          type="secondary"
        >
          Trading strategy
        </Title>
        <Pill type="primary" size="large" style={{ marginLeft: 0 }}>
          {mapTradingType[data?.trading_type]}
        </Pill>
      </Flex>
    </Card>
  );
};
