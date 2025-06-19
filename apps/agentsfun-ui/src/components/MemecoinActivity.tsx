import { useQuery } from '@tanstack/react-query';
import { LOCAL, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';

import { memecoinActivity } from '../mocks/mockAgentInfo';
import { MemecoinActivity as MemecoinActivityType } from '../types';
import memecoinActivityEmptyLogo from '../assets/memecoin-activity-empty.png';
import { Card } from './ui/Card';
import { Flex, Spin, Typography } from 'antd';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { formatTimestampToMonthDay } from '../utils/date';
import { FC } from 'react';
import { COLOR } from '../constants/theme';

const { Title, Text, Link } = Typography;

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const Loader: FC = () => (
  <Flex justify="center" align="center" style={{ height: 140, width: '100%' }}>
    <Spin />
  </Flex>
);

const NoActivity: FC = () => (
  <EmptyState
    logo={memecoinActivityEmptyLogo}
    message="No tokens caught the agent’s eye… yet. Stay tuned."
  />
);

const ErrorActivity: FC = () => (
  <ErrorState message="Failed to load memecoin activity. Please try again later." />
);

const useMemecoinActivity = () =>
  useQuery<MemecoinActivityType[] | null>({
    queryKey: ['xMemecoinActivity'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(memecoinActivity), 2000));
      }

      const response = await fetch(`${LOCAL}/memecoin-activity`);
      if (!response.ok) throw new Error('Failed to fetch Memecoin activity');
      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });

const Activity: FC = () => {
  const { isLoading, isError, data: memecoinActivity } = useMemecoinActivity();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorActivity />;
  if (!memecoinActivity) return <NoActivity />;

  return (
    <Flex gap={8} vertical>
      {memecoinActivity.map((activity) => {
        const tokenDetails = (() => {
          if (activity.type === 'heart') {
            return { emoji: '❤️', action: 'hearted' };
          } else if (activity.type === 'collect') {
            return { emoji: '💰', action: 'collected' };
          } else if (activity.type === 'purge') {
            return { emoji: '📝', action: 'purged' };
          } else if (activity.type === 'summon') {
            return { emoji: '👥', action: 'summoned' };
          } else if (activity.type === 'unleash') {
            return { emoji: '🔁', action: 'unleashed' };
          }
          return { emoji: '', action: '' };
        })();

        return (
          <Flex
            key={activity.postId}
            justify="space-between"
            align="center"
            style={{ width: '100%' }}
          >
            <Flex gap={8} align="center">
              <Text>
                {tokenDetails.emoji} Agent {tokenDetails.action}{' '}
                <Text style={{ color: COLOR.PRIMARY }}>{activity.token.symbol}</Text> token
              </Text>
              <Text type="secondary" className="text-xs">
                {UNICODE_SYMBOLS.BULLET}
              </Text>
              <Text type="secondary">{formatTimestampToMonthDay(activity.timestamp)}</Text>
            </Flex>
            <Link href={`https://x.com/i/web/status/${activity.postId}`} target="_blank">
              View on X {UNICODE_SYMBOLS.EXTERNAL_LINK}
            </Link>
          </Flex>
        );
      })}
    </Flex>
  );
};

export const MemecoinActivity: FC = () => (
  <Card>
    <Flex vertical gap={24} style={{ width: '100%' }}>
      <Title level={4} className="m-0">
        Recent Memecoin Activity
      </Title>
      <Activity />
    </Flex>
  </Card>
);
