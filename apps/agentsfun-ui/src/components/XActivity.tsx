import { useQuery } from '@tanstack/react-query';
import { Flex, Spin, Typography } from 'antd';
import styled from 'styled-components';
import {
  LOCAL,
  UNICODE_SYMBOLS,
  THIRTY_SECONDS,
} from '@agent-ui-monorepo/util-constants-and-types';

import { mockXActivity } from '../mock';
import { XActivity as XActivityType } from '../types';
import xActivityEmptyLogo from '../assets/x-activity-empty.png';
import { Card } from './ui/Card';

import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { formatTimestampToMonthDay } from '../utils/date';
import { FC } from 'react';
import { COLOR } from '../constants/theme';

const { Title, Text, Link } = Typography;

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const TweetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  gap: 12px;
  padding: 12px 24px 12px 16px;
  border-left: 4px solid ${COLOR.GRAY_2};
  background: ${COLOR.GRAY_1};
`;

const Loader: FC = () => (
  <Flex justify="center" align="center" style={{ height: 200, width: '100%' }}>
    <Spin />
  </Flex>
);

const NoActivity: FC = () => (
  <EmptyState
    logo={xActivityEmptyLogo}
    message="Nothing to show here. Give your agent some time to find something worth sharing."
  />
);

const ErrorActivity: FC = () => (
  <ErrorState message="Failed to load recent activity. Please try again later." />
);

const TweetText: FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g); // keep hashtags as separate tokens

  return (
    <Text>
      {parts.map((part, index) => (
        <Text key={index} style={part.startsWith('#') ? { color: COLOR.PRIMARY } : {}}>
          {part}
        </Text>
      ))}
    </Text>
  );
};

const useXActivity = () =>
  useQuery<XActivityType | null>({
    queryKey: ['xActivity'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(mockXActivity), 2000));
      }

      const response = await fetch(`${LOCAL}/x-activity`);
      if (!response.ok) throw new Error('Failed to fetch X activity');
      return response.json();
    },
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
    refetchInterval: THIRTY_SECONDS,
  });

const Activity: FC = () => {
  const { isLoading, isError, data: activity } = useXActivity();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorActivity />;
  if (!activity) return <NoActivity />;

  return (
    <Flex gap={8} vertical>
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Flex gap={8} align="center">
          <Text>Agent posted a message</Text>
          {activity?.timestamp && (
            <>
              <Text type="secondary" className="text-xs">
                {UNICODE_SYMBOLS.BULLET}
              </Text>
              <Text type="secondary">{formatTimestampToMonthDay(activity.timestamp)}</Text>
            </>
          )}
        </Flex>
        <Link href={`https://x.com/i/web/status/${activity?.postId}`} target="_blank">
          View on X {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Link>
      </Flex>

      <TweetContainer>
        {activity?.text && <TweetText text={activity.text} />}
        <Flex>
          {activity?.media?.map((media, index) => (
            <img
              key={index}
              src={`${LOCAL}/${media}`}
              alt={`Media ${index + 1}`}
              width={160}
              height={160}
              style={{ borderRadius: '8px' }}
            />
          ))}
        </Flex>
      </TweetContainer>
    </Flex>
  );
};

export const XActivity: FC = () => (
  <Card>
    <Flex vertical gap={24} style={{ width: '100%' }}>
      <Title level={4} className="m-0">
        Recent X Activity
      </Title>
      <Activity />
    </Flex>
  </Card>
);
