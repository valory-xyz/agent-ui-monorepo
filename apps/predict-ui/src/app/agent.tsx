import { UnlockChat } from '@agent-ui-monorepo/ui-chat';
import { Col, Flex, Row, Skeleton } from 'antd';
import { Frown, Unplug } from 'lucide-react';
import { ReactNode } from 'react';
import styled from 'styled-components';

import { AgentDetails } from '../components/AgentDetails';
import { Chat } from '../components/Chat/Chat';
import { ErrorState } from '../components/ErrorState';
import { MetricsUnavailable } from '../components/MetricsUnavailable';
import { AgentPerformance } from '../components/Performance';
import { ProfitOverTime } from '../components/ProfitOverTime/ProfitOverTime';
import { Strategy } from '../components/Strategy';
import { TradeHistory } from '../components/TradeHistory/TradeHistory';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { WithdrawLockedFunds } from '../components/WithdrawLockedFunds';
import { ARE_POLYSTRAT_METRICS_AVAILABLE } from '../constants/featureFlags';
import { COLOR } from '../constants/theme';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { useFeatures } from '../hooks/useFeatures';
import { AgentDetailsResponse } from '../types';
import { isPolystratAgent } from '../utils/agentMap';

const AgentContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
  width: 100%;
  margin: 48px auto 0;
`;

const AgentLoader = () => (
  <Flex vertical gap={24}>
    <AgentContent>
      <Card>
        <Row gutter={24} align="middle" justify="space-between" className="m-0">
          <Col lg={12} sm={12} xs={24} className="p-0">
            <Skeleton.Input active size="small" />
          </Col>
          <Col lg={12} sm={12} xs={24} className="p-0">
            <Skeleton.Input active size="small" />
          </Col>
        </Row>
      </Card>

      <Card>
        <Skeleton.Input active />
        <Row
          gutter={[24, 24]}
          align="middle"
          justify="space-between"
          className="m-0"
        >
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Col key={index} lg={8} sm={12} xs={24} className="p-0">
              <Skeleton.Input active style={{ width: 196 }} />
            </Col>
          ))}
        </Row>
      </Card>
    </AgentContent>
  </Flex>
);

const AgentError = () => (
  <Flex vertical gap={24}>
    <AgentContent>
      <ErrorState
        title="Error loading data"
        description="Something went wrong while loading data."
        icon={Unplug}
      />
    </AgentContent>
  </Flex>
);

const AgentNotFound = () => (
  <Flex vertical gap={24}>
    <AgentContent>
      <ErrorState
        title="404 | Agent not found"
        description="This address probably doesn't belong to an Olas agent."
        icon={Frown}
      />
    </AgentContent>
  </Flex>
);

const IncompleteDataAlert = () => (
  <Alert
    type="warning"
    message="Some performance data may be incomplete"
    description="After a recent Polymarket protocol upgrade, some winning payouts after Apr 28 may not be reflected in performance metrics or Trade history yet. Your agent is still running normally, and missing data will appear once indexing catches up."
  />
);

const ChatContent = () => {
  const { isLoading, data } = useFeatures();

  if (isLoading) return null;

  if (!data?.isChatEnabled) {
    return (
      <Card>
        <UnlockChat iconColor={COLOR.WHITE_TRANSPARENT_50} />
      </Card>
    );
  }

  return <Chat />;
};

type AgentLayoutProps = {
  agentDetails: AgentDetailsResponse;
  /** Section rendered between the agent details and the strategy card. */
  children: ReactNode;
  lockedAmount: number;
  metricsAvailable: boolean;
};

const AgentLayout = ({
  agentDetails,
  children,
  lockedAmount,
  metricsAvailable,
}: AgentLayoutProps) => (
  <Flex vertical gap={24}>
    <AgentContent>
      <AgentDetails
        createdAt={agentDetails.created_at}
        lastActiveAt={agentDetails.last_active_at}
      />
      {children}
      <Strategy />
      <ChatContent />
      <WithdrawLockedFunds
        lockedAmount={lockedAmount}
        marketName={isPolystratAgent ? 'Polymarket' : 'Omen'}
        metricsAvailable={metricsAvailable}
      />
    </AgentContent>
  </Flex>
);

// Polystrat metrics are sourced from a subgraph that is not yet indexed with
// the new Safe structure. Until then, hide the metric sections and point users
// to Polymarket. Flip the flag to restore the full UI.
const isPolystratMetricsUnavailable =
  isPolystratAgent && !ARE_POLYSTRAT_METRICS_AVAILABLE;

export const Agent = () => {
  const {
    data,
    isLoading,
    isError,
    isAgentDetailsLoading,
    isAgentDetailsError,
  } = useAgentDetails();

  // In the metrics-unavailable state the page must not depend on
  // /agent/performance (its subgraph isn't indexed yet and may error), so gate
  // on the agent-details query alone and render the card regardless.
  if (isPolystratMetricsUnavailable) {
    if (isAgentDetailsLoading) return <AgentLoader />;
    if (isAgentDetailsError) return <AgentError />;
    if (!data.agentDetails) return <AgentNotFound />;

    return (
      <AgentLayout
        agentDetails={data.agentDetails}
        lockedAmount={data.performance?.metrics.funds_locked_in_markets ?? 0}
        metricsAvailable={false}
      >
        <MetricsUnavailable agentSafeAddress={data.agentDetails.id} />
      </AgentLayout>
    );
  }

  if (isLoading) return <AgentLoader />;
  if (isError) return <AgentError />;
  if (!data.agentDetails || !data.performance) return <AgentNotFound />;

  const { agentDetails, performance } = data;

  return (
    <AgentLayout
      agentDetails={agentDetails}
      lockedAmount={performance.metrics.funds_locked_in_markets}
      metricsAvailable
    >
      {isPolystratAgent && <IncompleteDataAlert />}
      <AgentPerformance performance={performance} />
      <ProfitOverTime />
      <TradeHistory />
    </AgentLayout>
  );
};
