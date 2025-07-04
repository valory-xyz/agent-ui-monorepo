import { Button, Flex, Skeleton, Typography } from 'antd';
import { Card } from './ui/Card';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { FC } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { ErrorState } from './ui/ErrorState';
import { X_URL } from '@agent-ui-monorepo/util-constants-and-types';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const DescriptionContainer = styled(Flex)`
  .ant-typography-collapse,
  .ant-typography-expand {
    display: flex;
    margin: 0;
    font-size: 16px;
    line-height: 1.75;
    letter-spacing: 0.56px;
  }
`;

const PersonaLoading: FC = () => (
  <Flex vertical gap={24} style={{ width: '100%' }}>
    <Flex vertical align="flex-start">
      <Title level={3} className="m-0">
        <Skeleton.Input active />
      </Title>
      <Skeleton.Input active size="small" style={{ marginTop: 12 }} />
    </Flex>

    <Flex vertical gap={8} style={{ width: '100%' }}>
      <Text type="secondary">Persona</Text>
      <Flex vertical align="flex-start" gap={8}>
        <Skeleton.Input active block size="small" />
        <Skeleton.Input active block size="small" />
        <Skeleton.Input active size="small" style={{ width: 200 }} />
      </Flex>
    </Flex>
  </Flex>
);

const Description: FC<{ content: string }> = ({ content }) => {
  return (
    <DescriptionContainer vertical align="flex-start" gap={4}>
      <Paragraph
        ellipsis={{
          rows: 2,
          expandable: 'collapsible',
          defaultExpanded: false,
          symbol: (expanded) =>
            expanded ? (
              <Flex align="center" gap={4}>
                Hide full description
                <UpOutlined style={{ fontSize: 12 }} />
              </Flex>
            ) : (
              <Flex align="center" gap={4}>
                Show full description
                <DownOutlined style={{ fontSize: 12 }} />
              </Flex>
            ),
        }}
        className="mb-0"
      >
        {content}
      </Paragraph>
    </DescriptionContainer>
  );
};

const AgentPersona: FC = () => {
  const { isLoading, isError, data: agentDetails } = useAgentDetails();

  if (isLoading || !agentDetails) return <PersonaLoading />;
  if (isError) return <ErrorState message="Failed to load agent details." />;

  return (
    <Flex vertical gap={24}>
      <Flex vertical align="flex-start">
        <Title level={3} className="m-0">
          {agentDetails.name}
        </Title>
        <Button
          onClick={() => window.open(`${X_URL}/${agentDetails.username}`, '_blank')}
          type="link"
          className="p-0"
        >
          {`@${agentDetails.username}`}
        </Button>
      </Flex>

      <Flex vertical gap={8}>
        <Text type="secondary">Persona</Text>
        <Description content={agentDetails.personaDescription || ''} />
      </Flex>
    </Flex>
  );
};

/**
 * Displays the agent's persona information.
 */
export const Persona: FC = () => (
  <Card>
    <AgentPersona />
  </Card>
);
