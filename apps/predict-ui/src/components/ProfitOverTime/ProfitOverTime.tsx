import { LineChartOutlined } from '@ant-design/icons';
import { Flex, Segmented, Spin, Typography } from 'antd';
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
