import {
  AGENTS_FUN_URL,
  UNICODE_SYMBOLS,
  X_POST_URL,
} from '@agent-ui-monorepo/util-constants-and-types';
import { Flex, Spin, Typography } from 'antd';
import { FC, useMemo } from 'react';

import memecoinActivityEmptyLogo from '../assets/memecoin-activity-empty.png';
import { useMemecoinActivity } from '../hooks/useMemecoinActivity';
import { MemecoinActivityAction } from '../types';
import { formatTimestampToMonthDay } from '../utils/date';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

const { Title, Text, Link } = Typography;

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

type AgentActivityOnMemecoinProps = {
  type: MemecoinActivityAction;
  tokenSymbol: string;
};

const AgentActivityOnMemecoin: FC<AgentActivityOnMemecoinProps> = ({ type, tokenSymbol }) => {
  const details = useMemo(() => {
    switch (type) {
      case 'heart':
        return { emoji: '❤️', action: 'hearted' };
      case 'collect':
        return { emoji: '🎁', action: 'collected' };
      case 'purge':
        return { emoji: '🔥', action: 'purged' };
      case 'summon':
        return { emoji: '🪄', action: 'summoned' };
      case 'unleash':
        return { emoji: '🚀', action: 'unleashed' };
      default:
        return { emoji: '', action: '' };
    }
  }, [type]);

  if (!details.emoji || !details.action) {
    return <Text>Unknown activity type</Text>;
  }

  return (
    <Text>
      {details.emoji} Agent {details.action}{' '}
      <Link href={`${AGENTS_FUN_URL}/tools`} target="_blank">
        {tokenSymbol}
      </Link>{' '}
      token
    </Text>
  );
};

const Activity: FC = () => {
  const { isLoading, isError, data: memecoinActivity } = useMemecoinActivity();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorActivity />;
  if (!memecoinActivity) return <NoActivity />;

  return (
    <Flex gap={8} vertical>
      {memecoinActivity.map((activity) => (
        <Flex
          key={activity.postId}
          justify="space-between"
          align="center"
          style={{ width: '100%' }}
        >
          <Flex gap={8} align="center">
            <AgentActivityOnMemecoin type={activity.type} tokenSymbol={activity.token.symbol} />
            <Text type="secondary" className="text-xs">
              {UNICODE_SYMBOLS.BULLET}
            </Text>
            <Text type="secondary">{formatTimestampToMonthDay(activity.timestamp)}</Text>
          </Flex>
          <Link href={`${X_POST_URL}/${activity.postId}`} target="_blank">
            View on X {UNICODE_SYMBOLS.EXTERNAL_LINK}
          </Link>
        </Flex>
      ))}
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
