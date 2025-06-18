import { Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { AgentDetailsCard } from '../components/AgentDetailsCard/AgentDetailsCard';
import { LoaderCard } from '../components/AgentDetailsCard/LoaderCard';
import { AgentNotFoundError, LoadingError } from '../components/ErrorState';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { NavBarContainer } from '../components/ui/NavBarContainer';
import styled from 'styled-components';
import { AgentActivity } from '../components/AgentActivity';
import { AgentStatistics } from '../components/AgentStatistics';

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
      <Navbar agentType="trader" isTransparent />
    </NavBarContainer>
    <AgentContent>
      <LoadingError />
    </AgentContent>
  </Flex>
);

const AgentNotFound = () => (
  <Flex vertical gap={24}>
    <NavBarContainer>
      <Navbar agentType="trader" isTransparent />
    </NavBarContainer>
    <AgentContent>
      <AgentNotFoundError />
    </AgentContent>
  </Flex>
);

export const Agent = () => {
  const { data, isLoading, isFetched, isError } = useAgentDetails();

  if (isLoading) return <AgentLoader />;
  if (isError) return <AgentError />;
  if (!isFetched || !data.traderInfo) return <AgentNotFound />;

  return (
    <Flex vertical gap={24}>
      <NavBarContainer>
        <Navbar agentType="trader" userAddress={data.traderInfo.id} isTransparent />
      </NavBarContainer>
      <AgentContent>
        <AgentDetailsCard
          agent={{
            ...data.traderInfo,
            serviceAgentId: data.agentInfo?.agent_ids[0],
            serviceId: data.agentInfo?.service_id,
          }}
        />
        <AgentStatistics agent={data.traderInfo} />
        <AgentActivity agentId={data.traderInfo.id} />
      </AgentContent>
    </Flex>
  );
};
