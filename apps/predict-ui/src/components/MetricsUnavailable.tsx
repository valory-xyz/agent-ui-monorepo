import { Button, Flex, Typography } from 'antd';
import { ArrowUpRight, ChartNoAxesCombined } from 'lucide-react';
import styled from 'styled-components';

import { PolymarketIcon } from '../assets/Polymarket';
import { COLOR } from '../constants/theme';
import { getPolymarketProfileUrl } from '../utils/urls';
import { Card } from './ui/Card';

const { Title, Text } = Typography;

const ViewActivityButton = styled(Button)`
  padding: 8px 16px;
  border-radius: 8px;
  height: auto;
  background: ${COLOR.WHITE_TRANSPARENT_05};
  color: ${COLOR.WHITE_TRANSPARENT_75};

  &:hover {
    color: ${COLOR.WHITE_TRANSPARENT_75} !important;
    background: ${COLOR.WHITE_TRANSPARENT_10} !important;
  }
`;

type MetricsUnavailableProps = {
  /** Agent Safe address used to build the Polymarket profile link. */
  agentSafeAddress?: string;
};

export const MetricsUnavailable = ({ agentSafeAddress }: MetricsUnavailableProps) => {
  const profileUrl = getPolymarketProfileUrl(agentSafeAddress);

  return (
    <Card $gap="24px">
      <Flex vertical align="center" gap={24} className="text-center">
        <ChartNoAxesCombined size={40} color={COLOR.WHITE_TRANSPARENT_50} />

        <Flex vertical gap={8} align="center">
          <Title
            level={5}
            className="m-0 font-normal"
            style={{ color: COLOR.WHITE_TRANSPARENT_50 }}
          >
            Activity data unavailable in this app version
          </Title>
          <Text type="secondary" className="text-sm">
            You can review agent activity on Polymarket.
          </Text>
        </Flex>

        {profileUrl && (
          <ViewActivityButton href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Flex align="center" gap={6}>
              <PolymarketIcon />
              View agent activity
              <ArrowUpRight size={16} />
            </Flex>
          </ViewActivityButton>
        )}
      </Flex>
    </Card>
  );
};
