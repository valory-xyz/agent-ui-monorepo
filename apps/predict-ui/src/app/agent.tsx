import { UnlockChat } from '@agent-ui-monorepo/ui-chat';
import { Col, Flex, Row, Skeleton } from 'antd';
import { Frown, Unplug } from 'lucide-react';
import styled from 'styled-components';

import { AgentDetails } from '../components/AgentDetails';
import { BetHistory } from '../components/BetHistory';
import { Chat } from '../components/Chat/Chat';
import { ErrorState } from '../components/ErrorState';
import { AgentPerformance } from '../components/Performance';
import { ProfitOverTime } from '../components/ProfitOverTime/ProfitOverTime';
import { Strategy } from '../components/Strategy';
import { Card } from '../components/ui/Card';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { useFeatures } from '../hooks/useFeatures';

const IS_CHART_ENABLED = false; // TODO: enable once backend is ready

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
        <Row gutter={[24, 24]} align="middle" justify="space-between" className="m-0">
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

const ChatContent = () => {
  const { isLoading, data } = useFeatures();

  if (isLoading) return null;

  if (!data?.isChatEnabled) {
    return (
      <Card>
        <UnlockChat />
      </Card>
    );
  }

  return <Chat />;
};

export const Agent = () => {
  const { data, isLoading, isError } = useAgentDetails();

  if (isLoading) return <AgentLoader />;
  if (isError) return <AgentError />;
  if (!data.agentDetails || !data.performance) return <AgentNotFound />;

  const { agentDetails, performance } = data;

  return (
    <Flex vertical gap={24}>
      <AgentContent>
        <AgentDetails
          createdAt={agentDetails.created_at}
          lastActiveAt={agentDetails.last_active_at}
        />
        <AgentPerformance performance={performance} />
        {IS_CHART_ENABLED && <ProfitOverTime />}
        <BetHistory />
        <Strategy />
        <ChatContent />
      </AgentContent>
    </Flex>
  );
};
