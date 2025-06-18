import { Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import styled from 'styled-components';
import { useAgentDetails } from '../hooks/useAgentDetails';

const AgentContent = styled(Flex)`
  gap: 24px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

export const Agent = () => {
  const { data, isLoading } = useAgentDetails();

  // TODO: to implement error handling
  // TODO: to implement everything else

  return (
    <Flex vertical gap={24}>
      <Navbar agentType="agentsFun" isLoading={isLoading} userAddress={data?.address} />
      <AgentContent vertical>
        <div>Hello world!</div>
      </AgentContent>
    </Flex>
  );
};
