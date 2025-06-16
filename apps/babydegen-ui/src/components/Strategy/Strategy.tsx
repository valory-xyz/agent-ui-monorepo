import { InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Flex, Row, Skeleton, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

import { COLOR } from '../../constants/colors';
import { NA } from '../../constants/common';
import { PROTOCOLS_MAP, TRADING_TYPE_MAP } from '../../constants/textMaps';
import { usePortfolio } from '../../hooks/usePortfolio';
import { Pill } from '../../ui/Pill';
import { agentName } from '../../utils/agentMap';
import { SelectedProtocol } from '../../types';

const { Title, Text } = Typography;

const TradingStrategyTitle = () => (
  <Title level={5} style={{ marginBottom: 0, marginTop: 4 }} type="secondary">
    Trading strategy
    <Tooltip
      title={`Your ${agentName} agent’s strategy sets the threshold parameters that guide its investment decisions. Each strategy comes with a predefined set of thresholds that shape your agent’s activity.`}
    >
      <InfoCircleOutlined style={{ marginLeft: 6 }} />
    </Tooltip>
  </Title>
);

const OperatingProtocolsTitle = () => (
  <Title level={5} style={{ marginBottom: 0, marginTop: 4 }} type="secondary">
    Operating protocols
    <Tooltip title="Operating protocols are the protocols your agent uses to allocate funds and manage investments.">
      <InfoCircleOutlined style={{ marginLeft: 6 }} />
    </Tooltip>
  </Title>
);

const Loader = () => <Skeleton.Input style={{ width: 100 }} active size="small" />;

const StrategyContent = () => {
  const { isLoading, data } = usePortfolio();

  const operatingProtocols = useMemo(() => {
    if (!data?.selected_protocols) return [];

    return data.selected_protocols.map((protocol: SelectedProtocol) => (
      <Avatar
        key={protocol}
        size={36}
        src={PROTOCOLS_MAP[protocol].logo}
        style={{ border: `1px solid ${COLOR.lightGrey}`, padding: 6 }}
      />
    ));
  }, [data?.selected_protocols]);

  return (
    <Row>
      <Col md={12} xs={24}>
        <Flex vertical gap={8} align="self-start">
          <TradingStrategyTitle />

          {isLoading ? (
            <Loader />
          ) : !data?.trading_type ? (
            NA
          ) : (
            <Pill
              type={data.trading_type === 'risky' ? 'danger' : 'primary'}
              size="large"
              style={{ marginLeft: 0 }}
            >
              {TRADING_TYPE_MAP[data.trading_type]}
            </Pill>
          )}
        </Flex>
      </Col>

      <Col md={12} xs={24}>
        <Flex vertical gap={8} align="self-start">
          <OperatingProtocolsTitle />

          {isLoading ? (
            <Loader />
          ) : operatingProtocols.length === 0 ? (
            <Text type="secondary">No protocols</Text>
          ) : (
            <Flex gap={8} align="center">
              {operatingProtocols}
            </Flex>
          )}
        </Flex>
      </Col>
    </Row>
  );
};

/**
 * Trading strategy and protocols
 */
export const Strategy = () => (
  <Card className="card-border card-gradient">
    <StrategyContent />
  </Card>
);
