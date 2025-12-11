import { Flex, Segmented, Spin, Typography } from 'antd';
import { useState } from 'react';

import { useProfitOverTime } from '../../hooks/useProfitOverTime';
import { AgentWindow } from '../../types';
import { Card } from '../ui/Card';
import { Chart } from './Chart';

const { Title, Text, Paragraph } = Typography;

const WINDOW_OPTIONS: { label: string; value: AgentWindow }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All Time', value: 'lifetime' },
] as const;

export const ProfitOverTime = () => {
  const [currentWindow, setCurrentWindow] = useState<AgentWindow>('7d');
  const { isLoading, data, isError } = useProfitOverTime({ window: currentWindow });

  const points =
    data?.points.map((point) => ({
      timestamp: new Date(point.timestamp),
      value: point.delta_profit,
    })) || [];

  const handleWindowChange = (value: AgentWindow) => {
    setCurrentWindow(value);
  };

  return (
    <Card $gap="24px">
      <Flex justify="space-between" align="center">
        <Title level={4} className="m-0 font-normal">
          Profit Over Time
        </Title>
        <Segmented<AgentWindow>
          options={WINDOW_OPTIONS}
          value={currentWindow}
          onChange={handleWindowChange}
        />
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" style={{ height: '230px' }}>
          <Spin />
        </Flex>
      ) : isError ? (
        <Paragraph>
          <Text>Failed to load profit data.</Text>
        </Paragraph>
      ) : points.length === 0 ? (
        <Paragraph>
          <Text>No profit data available.</Text>
        </Paragraph>
      ) : (
        <Chart data={points} currency={data?.currency} />
      )}
    </Card>
  );
};
