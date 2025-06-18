import { Button, Flex, Skeleton, Typography } from 'antd';
import { Card } from './ui/Card';
import { useAgentDetails } from '../hooks/useAgentDetails';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const DescriptionLoading = () => (
  <Flex vertical align="flex-start" gap={8}>
    <Skeleton.Input active block size="small" />
    <Skeleton.Input active block size="small" />
    <Skeleton.Input active size="small" style={{ width: 200 }} />
  </Flex>
);

const Description = ({ desc }: { desc: string }) => {
  const [ellipsis, setEllipsis] = useState(true);

  return (
    <Flex vertical align="flex-start" gap={4}>
      <Paragraph
        ellipsis={ellipsis ? { rows: 2, expandable: false, symbol: '...' } : false}
        className="mb-0"
      >
        {desc}
      </Paragraph>
      <Button onClick={() => setEllipsis(!ellipsis)} type="link" className="p-0">
        {ellipsis ? 'Show full description' : 'Hide full description'}
        {ellipsis ? (
          <DownOutlined style={{ fontSize: 12 }} />
        ) : (
          <UpOutlined style={{ fontSize: 12 }} />
        )}
      </Button>
    </Flex>
  );
};

// TODO: ask design team about error handling states.
/**
 * Displays the agent's persona information.
 */
export const Persona = () => {
  const { data: agentDetails } = useAgentDetails();

  return (
    <>
      <Card>
        <Flex vertical gap={24}>
          <Flex vertical align="flex-start">
            <Title level={3} className="m-0">
              {agentDetails?.name}
            </Title>
            <Button
              onClick={() => window.open(`https://x.com/${agentDetails?.username}`, '_blank')}
              type="link"
              className="p-0"
            >
              {`@${agentDetails?.username}`}
            </Button>
          </Flex>

          <Flex vertical gap={8}>
            <Text type="secondary">Persona</Text>
            <Description desc={agentDetails?.personaDescription || ''} />
          </Flex>
        </Flex>
      </Card>

      {/* loader */}
      <Card>
        <Flex vertical gap={24} style={{ width: '100%' }}>
          <Flex vertical align="flex-start">
            <Title level={3} className="m-0">
              <Skeleton.Input active />
            </Title>
            <Skeleton.Input active size="small" style={{ marginTop: 12 }} />
          </Flex>

          <Flex vertical gap={8} style={{ width: '100%' }}>
            <Text type="secondary">Persona</Text>
            <DescriptionLoading />
          </Flex>
        </Flex>
      </Card>
    </>
  );
};
