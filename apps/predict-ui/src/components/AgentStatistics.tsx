import { useQuery } from '@tanstack/react-query';
import { Col, Flex, Row, Skeleton, Typography } from 'antd';
import {
  getConditionMarket,
  getMarketUserTrades,
  getUserPositions,
} from '../utils/graphql/queries';

import styled from 'styled-components';

import { Card } from '../components/ui/Card';

import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { getTimeAgo } from '../utils/time';
import { Condition, Fpmm, FpmmTrade, TraderAgent, UserPosition } from '../types';

const INVALID_ANSWER_HEX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const { Title, Text } = Typography;

const StatisticValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
`;

type AgentStatisticsProps = {
  agent: TraderAgent;
};

type UserBets = UserPosition & {
  fpmmTrades: FpmmTrade[];
  fpmm: Fpmm;
  condition: Condition;
};

const Statistic = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: string;
  isLoading?: boolean;
}) => (
  <Col span={12}>
    <Flex vertical gap={8}>
      <Text type="secondary">{title}</Text>
      {isLoading ? <Skeleton.Input active /> : <StatisticValue>{value}</StatisticValue>}
    </Flex>
  </Col>
);

const sortByNewestBet = (a: UserBets, b: UserBets) => {
  return (
    b.fpmmTrades[b.fpmmTrades.length - 1]?.creationTimestamp -
    a.fpmmTrades[a.fpmmTrades.length - 1]?.creationTimestamp
  );
};

const getNumberOfClosedBets = (userBets: UserBets[]) =>
  userBets?.reduce((acc, userPosition) => {
    const currentAnswer = userPosition.fpmm.currentAnswer;
    const closeTime = userPosition.fpmm.openingTimestamp * 1000;

    if ((currentAnswer !== null && currentAnswer !== INVALID_ANSWER_HEX) || closeTime < Date.now())
      return acc + 1;

    return acc;
  }, 0);

const getNumberOfWonBets = (userBets: UserBets[]) =>
  userBets?.reduce((acc, userPosition) => {
    const currentAnswer = userPosition.fpmm.currentAnswer;
    const outcomeIndex = Number(userPosition.position.indexSets[0]) - 1;

    if (currentAnswer !== null && Number(currentAnswer) === outcomeIndex) return acc + 1;

    return acc;
  }, 0);

export const AgentStatistics = ({ agent }: AgentStatisticsProps) => {
  const { data: successRate, isLoading } = useQuery({
    queryKey: ['getAgentSuccessRate', agent.id],
    queryFn: async () => {
      const userPositionsData = await getUserPositions({ id: agent.id.toLowerCase() });
      const userPositions = userPositionsData?.userPositions ?? [];

      const userPositionsComplete = await Promise.allSettled(
        userPositions.map(async (userPosition) => {
          try {
            const outcomeIndex = Number(userPosition.position.indexSets[0]) - 1;
            const conditionId = userPosition.position.conditionIdsStr;

            const omenConditionData = await getConditionMarket({
              id: conditionId,
            });
            const omenCondition = omenConditionData?.conditions[0];
            const market = omenCondition?.fixedProductMarketMakers[0];

            if (!market) return undefined;

            const tradesData = await getMarketUserTrades({
              creator: agent.id.toLowerCase(),
              fpmm: market.id,
              outcomeIndex_in: [outcomeIndex],
            });

            return {
              ...userPosition,
              fpmm: market,
              fpmmTrades: tradesData?.fpmmTrades || [],
            };
          } catch (error) {
            console.error(error);
          }
        }),
      ).then((results) =>
        results
          .filter(
            (result): result is PromiseFulfilledResult<UserBets> =>
              result.status === 'fulfilled' &&
              result.value !== undefined &&
              result.value.fpmmTrades.length > 0,
          )
          .map((result) => result.value)
          .sort(sortByNewestBet),
      );

      const numberOfClosedBets = getNumberOfClosedBets(userPositionsComplete);
      const numberOfWonBets = getNumberOfWonBets(userPositionsComplete);

      const successRate =
        numberOfClosedBets !== undefined &&
        numberOfClosedBets !== 0 &&
        numberOfWonBets !== undefined
          ? ((numberOfWonBets / numberOfClosedBets) * 100).toFixed(0)
          : '-';

      return successRate;
    },
  });

  return (
    <Card>
      <Title level={4} className="m-0">
        Agent statistics
      </Title>
      <Row>
        <Statistic title="Bets made" value={agent.totalBets.toLocaleString()} />
        <Statistic
          title="Prediction accuracy"
          value={successRate ? `${successRate}%` : NA}
          isLoading={isLoading}
        />
      </Row>
      <Row>
        <Statistic title="Created" value={getTimeAgo(Number(agent.firstParticipation) * 1000)} />
      </Row>
    </Card>
  );
};
