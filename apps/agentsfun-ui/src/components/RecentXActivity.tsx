import { useQuery } from '@tanstack/react-query';
import { LOCAL, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';

import { xActivity } from '../mocks/mockAgentInfo';
import { XActivity } from '../types';
import xActivityEmptyLogo from '../assets/x-activity-empty.png';
import { Card } from './ui/Card';
import { Flex, Spin, Typography } from 'antd';
import styled from 'styled-components';
import { ErrorState } from './ui/ErrorState';

const { Title, Text, Link } = Typography;

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const TweetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  gap: 12px;
  padding: 12px 24px 12px 16px;
  border-left: 4px solid #dbe9f1;
  background: #f6fbfe;
`;

const toMonthDay = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
};

const Loader = () => (
  <Flex justify="center" align="center" style={{ height: 200, width: '100%' }}>
    <Spin />
  </Flex>
);

const NoActivity = () => (
  <Flex justify="center" align="center" style={{ height: 200, width: '100%' }}>
    <Flex justify="center" align="center" vertical gap={24} style={{ maxWidth: 340 }}>
      <img src={xActivityEmptyLogo} alt="No recent activity" style={{ width: 40, height: 40 }} />
      <Text type="secondary" className="text-center">
        Nothing to show here. Give your agent some time to find something worth sharing.
      </Text>
    </Flex>
  </Flex>
);

const ErrorActivity = () => (
  <ErrorState message="Failed to load recent activity. Please try again later." />
);

const useXActivity = () =>
  useQuery<XActivity>({
    queryKey: ['xActivity'],
    queryFn: async () => {
      if (IS_MOCK_ENABLED) {
        return new Promise((resolve) => setTimeout(() => resolve(xActivity), 2000));
      }

      const response = await fetch(`${LOCAL}/x-activity`);
      if (!response.ok) throw new Error('Failed to fetch X activity');
      return response.json();
    },
  });

/**
 * Recent X Activity, showing the latest activity of the agent on X.
 */
export const Activity = () => {
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
              <Text type="secondary">{toMonthDay(activity?.timestamp)}</Text>
            </>
          )}
        </Flex>
        <Link href={`https://x.com/i/web/status/${activity?.postId}`} target="_blank">
          View on X {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Link>
      </Flex>

      <TweetContainer>
        <Text>{activity?.text}</Text>
        {/* TODO: to discuss with agent team, ignore for now */}
        <Flex style={{ display: 'none' }}>
          {activity?.media?.map((media, index) => (
            <img
              key={index}
              src={media}
              alt={`Media ${index + 1}`}
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          ))}
        </Flex>
      </TweetContainer>
    </Flex>
  );
};

export const RecentXActivity = () => (
  <Card>
    <Flex vertical gap={24} style={{ width: '100%' }}>
      <Title level={4} className="m-0">
        Recent X Activity
      </Title>
      <Activity />
    </Flex>
  </Card>
);
