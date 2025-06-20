import { Flex, Spin, Typography } from 'antd';
import styled from 'styled-components';
import { UNICODE_SYMBOLS, X_POST_URL } from '@agent-ui-monorepo/util-constants-and-types';

import xActivityEmptyLogo from '../assets/x-activity-empty.png';
import { Card } from './ui/Card';

import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { formatTimestampToMonthDay } from '../utils/date';
import { FC } from 'react';
import { COLOR } from '../constants/theme';
import { useXActivity } from '../hooks/useXActivity';

const { Title, Text, Link } = Typography;

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
          {activity.timestamp && (
            <>
              <Text type="secondary" className="text-xs">
                {UNICODE_SYMBOLS.BULLET}
              </Text>
              <Text type="secondary">{formatTimestampToMonthDay(activity.timestamp)}</Text>
            </>
          )}
        </Flex>
        <Link href={`${X_POST_URL}/${activity?.postId}`} target="_blank">
          View on X {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Link>
      </Flex>

      <TweetContainer>
        {activity.text && <TweetText text={activity.text} />}
        <Flex>
          {activity.media?.map((media, index) => (
            <div key={index} style={{ width: 160, height: 160 }}>
              {/* TODO: check image width */}
              <img
                src={media}
                alt={`Media ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  objectFit: 'contain',
                }}
              />
            </div>
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
