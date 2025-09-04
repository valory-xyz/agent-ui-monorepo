import { Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { AgentDetailsCard } from '../components/AgentDetailsCard/AgentDetailsCard';
import { LoaderCard } from '../components/AgentDetailsCard/LoaderCard';
import { AgentNotFoundError, LoadingError } from '../components/ErrorState';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { NavBarContainer } from '../components/ui/NavBarContainer';
import styled from 'styled-components';
import { AgentActivity } from '../components/AgentActivity';
import { AgentStatistics } from '../components/AgentStatistics/AgentStatistics';
import { UnlockChat } from '@agent-ui-monorepo/ui-chat';
import { useFeatures } from '../hooks/useFeatures';
import { Card } from '../components/ui/Card';

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

const StrategyAndChat = () => {
  const { isLoading, data } = useFeatures();

  if (isLoading) return;

  if (!data?.isChatEnabled) {
    return (
      <Card>
        <UnlockChat />
      </Card>
    );
  }

  return null;
  // return (
  //   <>
  //     <Strategy />
  //     <Chat />
  //   </>
  // );
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
        <StrategyAndChat />
      </AgentContent>
    </Flex>
  );
};
