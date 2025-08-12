import { Button, ButtonProps, Card, Row, Col, Flex, Skeleton, Typography, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

import { usePortfolio } from '../../hooks/usePortfolio';
import { CardTitle } from '../../ui/CardTitle';
import { BreakdownModal } from './BreakdownModal';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
    <Flex gap={2} align="flex-end">
      <Text type="secondary" style={{ paddingBottom: 4, fontSize: '16px' }}>
        $
      </Text>
      <Title level={2} className="m-0">
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
    <Flex gap={2} align="flex-end">
      <Title level={2} className="m-0">
        {data?.total_roi ?? 0}
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
      <Card className="card-gradient">
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
              <CardTitle
                text={
                  <span>
                    Total ROI Since Activation{' '}
                    {data && data.partial_roi ? (
                      <Tooltip
                        styles={{ body: { width: 365 } }}
                        title={
                          <>
                            <Paragraph type="secondary">
                              Total ROI shows your agent's comprehensive financial performance,
                              including trading profits from liquidity pool investments across
                              supported DEXs and staking rewards
                            </Paragraph>
                            <Paragraph type="secondary">
                              Partial ROI accounts only for core liquidity trading activities,
                              excluding staking rewards
                            </Paragraph>
                            <Flex justify="space-between">
                              <Text strong>Partial ROI</Text>
                              <Text strong>{`${data.partial_roi}%`}</Text>
                            </Flex>
                          </>
                        }
                      >
                        <InfoCircleOutlined style={{ marginLeft: 6 }} />
                      </Tooltip>
                    ) : null}
                  </span>
                }
              />
              <Roi />
            </Flex>
          </Col>
        </Row>
      </Card>

      <BreakdownModal open={breakdownModalVisible} onCancel={handleCloseBreakdownModal} />
    </>
  );
};
