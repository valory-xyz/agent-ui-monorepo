import { Button, ButtonProps, Card, Row, Col, Flex, Skeleton, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { CardTitle } from '../../ui/CardTitle';
import { BreakdownModal } from './BreakdownModal';

const { Title, Text } = Typography;

const PortfolioBalance = () => {
  const { data, isLoading } = usePortfolio();

  const portfolioBalance = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(data?.portfolio_value ?? 0),
    [data],
  );

  if (isLoading) {
    return <Skeleton.Input style={{ minHeight: 38 }} />;
  }

  return (
    <Flex gap={2} style={{ alignItems: 'flex-end' }}>
      <Text type="secondary" style={{ paddingBottom: 4, fontSize: '16px' }}>
        $
      </Text>
      <Title level={2} style={{ margin: 0 }}>
        {portfolioBalance}
      </Title>
    </Flex>
  );
};

const Roi = () => {
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return <Skeleton.Input style={{ minHeight: 38 }} />;
  }

  return (
    <Flex gap={2} style={{ alignItems: 'flex-end' }}>
      <Title level={2} style={{ margin: 0 }}>
        {data?.roi ?? 0}
      </Title>
      <Text type="secondary" style={{ paddingBottom: 4, fontSize: '16px' }}>
        %
      </Text>
    </Flex>
  );
};

const SeeBreakdownButton = (props: ButtonProps) => (
  <Button {...props} size="small" style={{ marginRight: 'auto' }}>
    See breakdown
  </Button>
);

export const Portfolio = () => {
  const { data } = usePortfolio();
  const [breakdownModalVisible, setBreakdownModalVisible] = useState(false);

  const handleOpenBreakdownModal = () => setBreakdownModalVisible(true);
  const handleCloseBreakdownModal = () => setBreakdownModalVisible(false);

  return (
    <>
      <Card className="card-border card-gradient">
        <Row>
          <Col md={12} xs={24}>
            <Flex vertical gap={8}>
              <CardTitle text="Portfolio" />
              <PortfolioBalance />
              <SeeBreakdownButton
                disabled={typeof data?.portfolio_value !== 'number'}
                onClick={handleOpenBreakdownModal}
              />
            </Flex>
          </Col>

          <Col md={12} xs={24}>
            <Flex vertical gap={8}>
              <CardTitle text="Avg ROI" />
              <Roi />
            </Flex>
          </Col>
        </Row>
      </Card>

      <BreakdownModal open={breakdownModalVisible} onCancel={handleCloseBreakdownModal} />
    </>
  );
};
