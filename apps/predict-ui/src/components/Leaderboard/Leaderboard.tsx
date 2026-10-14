import { Button, Col, Flex, Row, Segmented, Skeleton, Typography } from 'antd';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { useState } from 'react';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { LEADERBOARD_PAGE_URL } from '../../constants/urls';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { AgentLeaderboardResponse, LeaderboardWindow } from '../../types';
import { Card } from '../ui/Card';

const { Title, Text } = Typography;

const WINDOW_OPTIONS: { label: string; value: LeaderboardWindow }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
];

const EMPTY_STATE_COPY = {
  not_ranked_yet: {
    title: 'Not ranked yet.',
    description: 'Keep your agent running. It gets ranked after enough trades.',
  },
  not_enough_trades: {
    title: 'Not enough trades in this period.',
    description: "Try a different period to see your agent's rank.",
  },
  unavailable: {
    title: 'Rank unavailable right now.',
    description: 'Please check back later.',
  },
} as const;

type EmptyState = keyof typeof EMPTY_STATE_COPY;

export type LeaderboardState =
  | { kind: 'loading' }
  | { kind: 'ranked'; rankByRoi: number; rankByPnl: number; total: number }
  | { kind: EmptyState };

/** Maps the agent response (or a failed request) to what the card shows. */
export const getLeaderboardState = (
  data: AgentLeaderboardResponse | undefined,
  isLoading: boolean,
  isError: boolean,
): LeaderboardState => {
  if (isLoading) return { kind: 'loading' };
  if (isError || !data) return { kind: 'unavailable' };

  if (data.status === 'ranked') {
    const { rank_by_roi, rank_by_pnl, total_ranked } = data;
    if (rank_by_roi === null || rank_by_pnl === null || total_ranked === null) {
      return { kind: 'unavailable' };
    }
    return {
      kind: 'ranked',
      rankByRoi: rank_by_roi,
      rankByPnl: rank_by_pnl,
      total: total_ranked,
    };
  }

  if (data.status === 'not_ranked') {
    return data.not_ranked_reason === 'not_enough_trades_in_window'
      ? { kind: 'not_enough_trades' }
      : { kind: 'not_ranked_yet' };
  }

  return { kind: 'unavailable' };
};

/** The window control only helps where another window can give a different result. */
const showsWindowControl = (kind: LeaderboardState['kind']) =>
  kind === 'loading' || kind === 'ranked' || kind === 'not_enough_trades';

const LeaderboardButton = styled(Button)<{ $centered: boolean }>`
  align-self: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
  padding: 4px 12px;
  border-radius: 8px;
  height: auto;
  background: ${COLOR.WHITE_TRANSPARENT_05};
  color: ${COLOR.WHITE_TRANSPARENT_75};

  &:hover {
    color: ${COLOR.WHITE_TRANSPARENT_75} !important;
    background: ${COLOR.WHITE_TRANSPARENT_10} !important;
  }
`;

const RankTile = ({ label, rank, total }: { label: string; rank: number; total: number }) => (
  <Flex vertical gap={8}>
    <Text type="secondary">{label}</Text>
    <Flex align="baseline" gap={4}>
      <Text type="secondary" className="text-sm">
        #
      </Text>
      <Title level={3} className="m-0">
        {rank}
      </Title>
      <Text type="secondary" className="text-sm">
        of {total}
      </Text>
    </Flex>
  </Flex>
);

const LeaderboardEmptyState = ({ state }: { state: EmptyState }) => (
  <Flex vertical align="center" gap={16} className="text-center" style={{ padding: '16px 0' }}>
    <Trophy size={32} color={COLOR.WHITE_TRANSPARENT_50} aria-hidden />
    <Flex vertical align="center">
      <Text type="secondary">{EMPTY_STATE_COPY[state].title}</Text>
      <Text type="secondary">{EMPTY_STATE_COPY[state].description}</Text>
    </Flex>
  </Flex>
);

const RankSkeleton = () => (
  <Row gutter={[24, 16]} className="m-0" data-testid="leaderboard-skeleton">
    {[0, 1].map((index) => (
      <Col key={index} sm={12} xs={24} className="p-0">
        <Flex vertical gap={8}>
          <Skeleton.Input active size="small" />
          <Skeleton.Input active />
        </Flex>
      </Col>
    ))}
  </Row>
);

export const Leaderboard = () => {
  const [currentWindow, setCurrentWindow] = useState<LeaderboardWindow>('7d');
  const { data, isLoading, isError } = useLeaderboard({
    window: currentWindow,
  });
  const state = getLeaderboardState(data, isLoading, isError);

  // The agent always returns a URL; the constant only covers a failed request.
  const leaderboardUrl = data?.leaderboard_url ?? (isError ? LEADERBOARD_PAGE_URL : undefined);
  const showButton = (state.kind === 'ranked' || state.kind === 'unavailable') && !!leaderboardUrl;

  return (
    <Card $gap="24px">
      <Flex justify="space-between" align="center" wrap gap={16}>
        <Title level={4} className="m-0 font-normal">
          <span aria-hidden>🏆</span> Leaderboard
        </Title>
        {showsWindowControl(state.kind) && (
          <Segmented<LeaderboardWindow>
            aria-label="Leaderboard period"
            options={WINDOW_OPTIONS}
            value={currentWindow}
            onChange={(x: LeaderboardWindow) => setCurrentWindow(x)}
          />
        )}
      </Flex>

      {state.kind === 'loading' ? (
        <RankSkeleton />
      ) : state.kind === 'ranked' ? (
        <Row gutter={[24, 16]} className="m-0">
          <Col sm={12} xs={24} className="p-0">
            <RankTile label="Rank by ROI" rank={state.rankByRoi} total={state.total} />
          </Col>
          <Col sm={12} xs={24} className="p-0">
            <RankTile label="Rank by PnL" rank={state.rankByPnl} total={state.total} />
          </Col>
        </Row>
      ) : (
        <LeaderboardEmptyState state={state.kind} />
      )}

      {showButton && (
        <LeaderboardButton
          $centered={state.kind !== 'ranked'}
          href={leaderboardUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Flex align="center" gap={6} className="text-sm">
            See full leaderboard
            <ArrowUpRight size={14} />
          </Flex>
        </LeaderboardButton>
      )}
    </Card>
  );
};
