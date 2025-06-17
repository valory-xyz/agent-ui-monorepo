import { Flex } from 'antd';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import styled from 'styled-components';

const AgentContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

export const Agent = () => {
  return (
    <Flex vertical gap={24}>
      <Navbar agentType="agentsFun" isLoading />
    </Flex>
  );
};
