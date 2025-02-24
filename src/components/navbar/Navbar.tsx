import { Avatar, Flex, Skeleton, Typography } from 'antd';
import React, { useMemo } from 'react';
import Jazzicon from 'react-jazzicon';

import { usePortfolio } from '../../hooks/usePortfolio';
import { generateName } from '../../utils/agentName';

const { Text } = Typography;

const AgentBranding = () => {
  return (
    <Flex gap={8} align="center">
      <img
        src="/logos/modius.png"
        alt="Agent Branding"
        style={{ width: 40, height: 40 }}
      />
      <Flex vertical gap={0} style={{ fontSize: 14 }}>
        <Text strong>Modius</Text>
        <Text type="secondary">Agent economy</Text>
      </Flex>
    </Flex>
  );
};

const AgentIdentity = () => {
  const { data, isFetched } = usePortfolio();

  const agentName: string | null = useMemo(() => {
    if (!isFetched) return null;
    if (data && data.address) return generateName(data.address);
    return null;
  }, [data, isFetched]);

  const agentAvatar = useMemo(() => {
    if (agentName) {
      return <Jazzicon diameter={32} seed={Number(data.address)} />;
    }
    return <Avatar size={32} />;
  }, [agentName, data?.address]);

  return (
    <Flex gap={8} align="center">
      {agentAvatar}
      <Flex vertical>
        {agentName ? (
          <Text strong style={{ height: 17 }}>
            {agentName}
          </Text>
        ) : (
          <Skeleton.Input active={!isFetched} style={{ height: 17 }} />
        )}
        <Text
          type="secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 20 }}
        >
          Modius agent
        </Text>
      </Flex>
    </Flex>
  );
};

export default function Navbar() {
  return (
    <Flex
      justify="space-between"
      style={{
        height: 68,
        minHeight: 68,
        padding: '12px 24px',
        borderBottom: '1px solid #DFE5EE',
      }}
    >
      <AgentBranding />
      <AgentIdentity />
    </Flex>
  );
}
