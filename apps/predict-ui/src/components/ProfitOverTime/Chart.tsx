import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { Flex } from 'antd';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styled from 'styled-components';

import { CURRENCY, CurrencyCode } from '../../constants/currency';
import { CHART_HEIGHT } from '../../constants/sizes';
import { COLOR } from '../../constants/theme';

const TooltipContainer = styled(Flex)`
  padding: 8px;
  background-color: ${COLOR.BLACK_BACKGROUND};
  border-radius: 8px;
  color: ${COLOR.TEXT_PRIMARY};
  font-size: 12px;
`;

const formattedDate = (date: Date) =>
  date.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ChartTooltip = ({ currencySymbol }: { currencySymbol: string }) => (
  <Tooltip
    content={({ payload, label }) => {
      const value = payload?.[0]?.value;
      const text = (() => {
        if (typeof value !== 'number') return NA;
        if (isNaN(value)) return NA;
        if (value === 0) return `No Profit or Loss`;
        return `${value > 0 ? 'Profit of ' : 'Loss of '}${currencySymbol}${value.toFixed(2)}`;
      })();
      return (
        <TooltipContainer vertical gap={4}>
          <span>
            <b>{text}</b>
          </span>
          <span>{label ? formattedDate(new Date(label)) : NA}</span>
        </TooltipContainer>
      );
    }}
  />
);

type ChartProps = {
  currency?: CurrencyCode;
  data: { timestamp: Date; value: number }[];
};

export const Chart = ({ currency = 'USD', data }: ChartProps) => {
  const currencySymbol = CURRENCY[currency]?.symbol || '$';

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart data={data}>
        <CartesianGrid
          stroke={COLOR.WHITE_TRANSPARENT_20}
          strokeDasharray="8 8"
          strokeWidth={1}
          opacity={0.8}
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) =>
            new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(timestamp)
          }
          tick={{ fill: COLOR.SECONDARY, fontSize: 14 }}
          minTickGap={20}
          allowDataOverflow
          axisLine={false}
          tickLine={false}
          tickMargin={16}
        />
        <YAxis
          orientation="right"
          tickFormatter={(value) => `${currencySymbol}${value.toFixed(2)}`}
          tick={{ fill: COLOR.SECONDARY, fontSize: 14 }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickMargin={16}
        />
        <ChartTooltip currencySymbol={currencySymbol} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={COLOR.TEXT_PRIMARY}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
