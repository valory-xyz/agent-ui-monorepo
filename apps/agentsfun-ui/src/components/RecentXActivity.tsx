import { useQuery } from '@tanstack/react-query';
import { LOCAL, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';

import { xActivity } from '../mocks/mockAgentInfo';
import { XActivity } from '../types';
import { Card } from './ui/Card';
import { Flex, Typography } from 'antd';

const { Title, Text, Paragraph, Link } = Typography;

const IS_MOCK_ENABLED = process.env.IS_MOCK_ENABLED === 'true';

const toMonthDay = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
};

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
    retry: 3,
  });

// TODO: loading and error states.
// TODO: empty state.
/**
 * Recent X Activity, showing the latest activity of the agent on X.
 */
export const RecentXActivity = () => {
  const { isLoading, data: activity } = useXActivity();

  return (
    <Card>
      <Flex vertical gap={24} style={{ width: '100%' }}>
        <Title level={4} className="m-0">
          Recent X Activity
        </Title>

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
      </Flex>
    </Card>
  );
};
