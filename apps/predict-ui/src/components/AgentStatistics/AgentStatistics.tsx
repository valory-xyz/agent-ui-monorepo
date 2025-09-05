import { Row, Typography } from 'antd';

import { Card } from '../../components/ui/Card';
import { TraderAgent } from '../../types';
import { getTimeAgo } from '../../utils/time';
import { RoiCard } from './RoiCard';
import { StatisticCard } from './StatisticCard';
import { SuccessRateCard } from './SuccessRateCard';

const { Title } = Typography;

type AgentStatisticsProps = {
  agent: TraderAgent;
};

export const AgentStatistics = ({ agent }: AgentStatisticsProps) => {
  return (
    <Card>
      <Title level={4} className="m-0">
        Agent statistics
      </Title>
      <Row>
        <StatisticCard title="Bets made" value={agent.totalBets.toLocaleString()} />
        <SuccessRateCard agent={agent} />
      </Row>
      <Row>
        <StatisticCard title="Created" value={getTimeAgo(Number(agent.blockTimestamp) * 1000)} />
        <RoiCard agent={agent} />
      </Row>
    </Card>
  );
};
