import { UnlockChat } from '@agent-ui-monorepo/ui-chat';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { Flex } from 'antd';
import styled from 'styled-components';

import { AgentActivity } from '../components/AgentActivity';
import { AgentDetailsCard } from '../components/AgentDetailsCard/AgentDetailsCard';
import { LoaderCard } from '../components/AgentDetailsCard/LoaderCard';
import { AgentStatistics } from '../components/AgentStatistics/AgentStatistics';
import { Chat } from '../components/Chat/Chat';
import { AgentNotFoundError, LoadingError } from '../components/ErrorState';
import { Strategy } from '../components/Strategy';
import { Card } from '../components/ui/Card';
import { NavBarContainer } from '../components/ui/NavBarContainer';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { useFeatures } from '../hooks/useFeatures';

const AgentContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

const AgentLoader = () => (
  <Flex vertical gap={24}>
    <NavBarContainer />
    <AgentContent>
      <LoaderCard />
    </AgentContent>
  </Flex>
);

const AgentError = () => (
  <Flex vertical gap={24}>
    <NavBarContainer>
      <Navbar agentType="trader" />
    </NavBarContainer>
    <AgentContent>
      <LoadingError />
    </AgentContent>
  </Flex>
);

const AgentNotFound = () => (
  <Flex vertical gap={24}>
    <NavBarContainer>
      <Navbar agentType="trader" />
    </NavBarContainer>
    <AgentContent>
      <AgentNotFoundError />
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
  const { data, isLoading, isFetched, isError } = useAgentDetails();

  if (isLoading) return <AgentLoader />;
  if (isError) return <AgentError />;
  if (!isFetched || !data.traderInfo) return <AgentNotFound />;

  return (
    <Flex vertical gap={24}>
      <NavBarContainer>
        <Navbar agentType="trader" userAddress={data.traderInfo.id} />
      </NavBarContainer>
      <AgentContent>
        <AgentDetailsCard
          agent={{
            ...data.traderInfo,
            serviceAgentId: data.agentInfo?.agent_ids[0],
          }}
        />
        <AgentStatistics agent={data.traderInfo} />
        <AgentActivity agentId={data.traderInfo.id} />
        <Strategy />
        <ChatContent />
      </AgentContent>
    </Flex>
  );
};
