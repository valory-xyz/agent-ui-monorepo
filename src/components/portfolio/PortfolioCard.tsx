import { Button, ButtonProps, Card, Flex, Skeleton, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { BreakdownModal } from '../breakdown-modal/BreakdownModal';

const { Title } = Typography;

const PortfolioTitle = () => (
  <Title level={4} style={{ marginBottom: 0 }} type="secondary">
    Portfolio
  </Title>
);

const PortfolioBalance = () => {
  const { data, isFetched } = usePortfolio();

  const portfolioBalance = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(data?.['portfolio-value'] ?? 0),
    [data],
  );

  if (!isFetched) {
    return <Skeleton.Input style={{ minHeight: 38 }} />;
  }

  return (
    <Flex gap={2} style={{ alignItems: 'flex-end' }}>
      <span style={{ paddingBottom: 4, fontWeight: 'bold' }}>$</span>
      <Title level={2} style={{ margin: 0 }}>
        {portfolioBalance}
      </Title>
    </Flex>
  );
};

const SeeBreakdownButton = (props: ButtonProps) => (
  <Button {...props} size="small" style={{ marginRight: 'auto' }}>
    See breakdown
  </Button>
);

export default function PortfolioCard() {
  const { data } = usePortfolio();
  const [breakdownModalVisible, setBreakdownModalVisible] = useState(false);

  const handleOpenBreakdownModal = () => setBreakdownModalVisible(true);
  const handleCloseBreakdownModal = () => setBreakdownModalVisible(false);

  return (
    <>
      <Card className="card-gradient">
        <Flex vertical gap={8}>
          <PortfolioTitle />
          <PortfolioBalance />
          <SeeBreakdownButton
            disabled={typeof data?.['portfolio-value'] !== 'number'}
            onClick={handleOpenBreakdownModal}
          />
        </Flex>
      </Card>
      <BreakdownModal
        open={breakdownModalVisible}
        onCancel={handleCloseBreakdownModal}
      />
    </>
  );
}
