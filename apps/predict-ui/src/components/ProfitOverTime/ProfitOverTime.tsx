import { LineChartOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Flex, Segmented, Spin, Typography } from 'antd';
import { useMemo, useState } from 'react';
import styled from 'styled-components';

import { CHART_HEIGHT } from '../../constants/sizes';
import { COLOR } from '../../constants/theme';
import { useProfitOverTime } from '../../hooks/useProfitOverTime';
import { AgentWindow } from '../../types';
import { Card } from '../ui/Card';
import { Chart } from './Chart';

const { Title, Text } = Typography;

const WINDOW_OPTIONS: { label: string; value: AgentWindow }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All Time', value: 'lifetime' },
] as const;

const Container = styled(Flex)`
  width: 100%;
  height: ${CHART_HEIGHT}px;
  background-color: ${COLOR.WHITE_TRANSPARENT_05};
  border-radius: 8px;
`;

const NoDataAvailable = () => (
  <Flex align="center" justify="center" vertical style={{ padding: '32px 0' }}>
    <LineChartOutlined
      className="mb-24"
      style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: COLOR.WHITE_TRANSPARENT_50,
      }}
    />
    <Text type="secondary">No data yet.</Text>
    <Text type="secondary">Profit over time will appear here when available.</Text>
  </Flex>
);

// TODO: temporarily added until we use new merged LM&MM subgraph. Remove when not needed
const UnaccountedFeesAlert = () => (
  <Alert
    message={
      <Flex gap={8} vertical>
        <span style={{ fontWeight: 500 }}>Data update in progress</span>
        <span>
          Mech fees for invalid markets and markets in which agents did not place trades are
          currently unaccounted for. This leads to an underreporting of costs. A fix is in progress.
        </span>
      </Flex>
    }
    type="warning"
    showIcon
    icon={
      <WarningOutlined style={{ fontSize: 18, marginTop: '2px', color: 'rgba(255, 255, 0, 1)' }} />
    }
    style={{
      padding: '12px',
      alignItems: 'flex-start',
      background: 'rgba(255, 255, 0, 0.1)',
      borderColor: 'rgba(255, 255, 0, 0.1)',
      color: 'rgba(255, 255, 0, 1)',
    }}
  />
);

export const ProfitOverTime = () => {
  const [currentWindow, setCurrentWindow] = useState<AgentWindow>('7d');
  const { isLoading, data, isError } = useProfitOverTime({
    window: currentWindow,
  });

  const points = useMemo(() => {
    if (!data || data.points.length === 0) return [];
    return data.points.map((point) => ({
      timestamp: new Date(point.timestamp),
      value: point.delta_profit,
    }));
  }, [data]);

  return (
    <Card $gap="24px">
      <Flex justify="space-between" align="center">
        <Title level={4} className="m-0 font-normal">
          Profit Over Time
        </Title>
        {points.length > 0 && (
          <Segmented<AgentWindow>
            options={WINDOW_OPTIONS}
            value={currentWindow}
            onChange={(x: AgentWindow) => setCurrentWindow(x)}
          />
        )}
      </Flex>

      <UnaccountedFeesAlert />

      {isLoading ? (
        <Container justify="center" align="center">
          <Spin />
        </Container>
      ) : isError ? (
        <Container justify="center" align="center">
          <Text className="text-sm text-white-075">Failed to load profit data.</Text>
        </Container>
      ) : points.length === 0 ? (
        <NoDataAvailable />
      ) : (
        <Chart data={points} currency={data?.currency} />
      )}
    </Card>
  );
};
