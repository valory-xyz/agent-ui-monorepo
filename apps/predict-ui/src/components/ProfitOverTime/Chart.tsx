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

type ChartProps = {
  currency?: CurrencyCode;
  data: { timestamp: Date; value: number }[];
};

export const Chart = ({ currency = 'USD', data }: ChartProps) => {
  const currencySymbol = CURRENCY[currency]?.symbol || '$';

  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data}>
        <CartesianGrid stroke="#6A5C9A" strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) =>
            new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(timestamp)
          }
          tick={{ fill: COLOR.SECONDARY, fontSize: 12 }}
          interval="preserveEnd"
          minTickGap={20}
          allowDataOverflow
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          orientation="right"
          tickFormatter={(value) => `${currencySymbol}${value.toFixed(2)}`}
          tick={{ fill: COLOR.SECONDARY, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={({ payload, label }) => {
            const value = payload?.[0]?.value;
            return (
              <TooltipContainer vertical gap={4}>
                <span>
                  <b>{`${value >= 0 ? 'Profit of ' : 'Loss of '}${currencySymbol}${value?.toFixed(2)}`}</b>
                </span>
                <span>{label ? formattedDate(new Date(label)) : NA}</span>
              </TooltipContainer>
            );
          }}
        />
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
