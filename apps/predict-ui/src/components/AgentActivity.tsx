import { GNOSIS_SCAN_URL, NA } from '@agent-ui-monorepo/util-constants-and-types';
import { useQuery } from '@tanstack/react-query';
import { Flex, Spin, Timeline, TimelineItemProps, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Card } from '../components/ui/Card';
import { NoDataContainer } from '../components/ui/NoDataContainer';
import { PREDICT_APP_URL } from '../constants/urls';
import { FpmmTrade, FpmmTrades } from '../types';
import { getUserTrades } from '../utils/graphql/queries';
import { getTimeAgo } from '../utils/time';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

type AgentActivityProps = {
  agentId: string;
};

type ActivityItem = {
  id: string;
  question: string;
  questionId: string;
  outcome: string;
  betAmount: string;
  timeAgo: string;
  time: string;
  txHash: string;
};

const getActivityItems = (trades: FpmmTrade[]): ActivityItem[] => {
  return trades.map((item) => {
    const betAmount = parseFloat(item.collateralAmountUSD).toFixed(5);

    const outcomeValue =
      item.fpmm.outcomes && item.outcomeIndex ? item.fpmm.outcomes[item.outcomeIndex] : null;

    return {
      id: item.id,
      question: item.title || NA,
      questionId: item.fpmm.id,
      outcome: outcomeValue || NA,
      betAmount: `$${betAmount}`,
      timeAgo: getTimeAgo(item.creationTimestamp * 1000),
      time: new Date(item.creationTimestamp * 1000).toLocaleString(),
      txHash: item.transactionHash,
    };
  });
};

export const AgentActivity = ({ agentId }: AgentActivityProps) => {
  const { data, isLoading } = useQuery<FpmmTrades>({
    queryKey: ['getUserTrades', agentId],
    queryFn: async () =>
      getUserTrades({
        creator: agentId.toLowerCase(),
        first: 1000,
        skip: 0,
        orderBy: 'creationTimestamp',
        orderDirection: 'desc',
      }),
  });

  const [trades, setTrades] = useState<ActivityItem[]>([]);

  const timelineItems = (items: ActivityItem[]): TimelineItemProps[] => {
    return items.map((item) => ({
      children: (
        <Flex vertical gap={8} key={item.id}>
          <Text>
            <b>Trader agent</b> bet{' '}
            <a
              href={`${GNOSIS_SCAN_URL}/tx/${item.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <b>{item.betAmount}</b>
            </a>{' '}
            on <b>{item.outcome}</b>
          </Text>
          <a
            href={`${PREDICT_APP_URL}/questions/${item.questionId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text>{item.question}</Text>
          </a>
          <Text type="secondary" title={item.time}>
            {item.timeAgo}
          </Text>
        </Flex>
      ),
    }));
  };

  const items = timelineItems(trades);

  useEffect(() => {
    if (!data) return;
    const lastTrades = data.fpmmTrades.slice(0, PAGE_SIZE);
    setTrades(getActivityItems(lastTrades));
  }, [data]);

  const loadMoreData = useCallback(() => {
    if (!data) return;

    // Simulate data loading with timeout
    setTimeout(() => {
      const nextTrades = data.fpmmTrades.slice(
        trades.length,
        Math.min(trades.length + PAGE_SIZE, data.fpmmTrades.length),
      );
      setTrades((prev) => [...prev, ...getActivityItems(nextTrades)]);
    }, 1000);
  }, [data, trades.length]);

  return (
    <Card>
      <Title level={4} className="m-0">
        Latest activity
      </Title>

      {isLoading ? (
        <NoDataContainer>
          <Spin size="large" />
        </NoDataContainer>
      ) : items.length === 0 ? (
        <NoDataContainer>
          <Text>No data available</Text>
        </NoDataContainer>
      ) : (
        <InfiniteScroll
          dataLength={trades.length}
          next={loadMoreData}
          height={380}
          hasMore={data ? trades.length < data.fpmmTrades.length : false}
          loader={<div />}
        >
          <Timeline
            pending={data && trades.length < data.fpmmTrades.length ? 'Loading...' : null}
            items={items}
          />
        </InfiniteScroll>
      )}
    </Card>
  );
};
