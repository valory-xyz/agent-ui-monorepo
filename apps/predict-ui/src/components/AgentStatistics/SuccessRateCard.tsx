import { useQuery } from '@tanstack/react-query';
import { getTraderAgentBets } from '../../utils/graphql/queries';

import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { TraderAgent } from '../../types';
import { StatisticCard } from './StatisticCard';

const INVALID_ANSWER_HEX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

type SuccessRateCardProps = {
  agent: TraderAgent;
};

export const SuccessRateCard = ({ agent }: SuccessRateCardProps) => {
  const { data: successRate, isLoading } = useQuery({
    queryKey: ['getAgentSuccessRate', agent.id],
    queryFn: async () => {
      const agentBetsData = await getTraderAgentBets({ id: agent.id.toLowerCase() });
      if (!agentBetsData.traderAgent) return null;
      // Get only bets on closed markets
      const betsOnClosedMarkets = agentBetsData.traderAgent.bets.filter(
        (bet) => bet.fixedProductMarketMaker.currentAnswer !== null,
      );
      const totalBets = betsOnClosedMarkets.length;
      // Calculate amount of won bets
      let wonBets = 0;

      betsOnClosedMarkets.forEach((bet) => {
        const marketAnswer = bet.fixedProductMarketMaker.currentAnswer;
        const betAnswer = bet.outcomeIndex;
        if (marketAnswer === INVALID_ANSWER_HEX) return;
        if (Number(marketAnswer) === Number(betAnswer)) {
          wonBets += 1;
        }
      });

      return ((wonBets / totalBets) * 100).toFixed(0);
    },
  });

  return (
    <StatisticCard
      title="Prediction accuracy"
      value={successRate ? `${successRate}%` : NA}
      isLoading={isLoading}
    />
  );
};
