import { Card, Flex, Typography } from 'antd';
import React, { useMemo } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';

const PortfolioTitle = () => (
  <Typography.Title level={4}>Portfolio</Typography.Title>
);

const PortfolioBalance = () => {
  const { data } = usePortfolio();

  const portfolioBalance = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(data?.['portfolio-value'] ?? 0),
    [data],
  );

  return (
    <Flex gap={2} style={{ alignItems: 'flex-end' }}>
      <span style={{ paddingBottom: 4, fontWeight: 'bold' }}>$</span>
      <Typography.Title level={2} style={{ margin: 0 }}>
        {portfolioBalance}
      </Typography.Title>
    </Flex>
  );
};

export default function PortfolioCard() {
  return (
    <Card className="card-gradient">
      <Flex vertical>
        <PortfolioTitle />
        <PortfolioBalance />
      </Flex>
    </Card>
  );
}
