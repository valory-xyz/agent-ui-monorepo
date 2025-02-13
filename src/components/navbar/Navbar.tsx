import { Flex, Typography } from 'antd';
import React from 'react';
import Jazzicon from 'react-jazzicon';

import { generateName } from '../../utils/agentName';

export const AgentBranding = () => {
  return (
    <Flex gap={8} align="center">
      <img
        src="/logos/modius.png"
        alt="Agent Branding"
        style={{ width: 40, height: 40 }}
      />
      <Flex vertical gap={0} style={{ fontSize: 14 }}>
        <Typography.Text strong>Modius</Typography.Text>
        <Typography.Text type="secondary">Agent economy</Typography.Text>
      </Flex>
    </Flex>
  );
};

export const AgentIdentity = () => {
  // TODO: update once agent address available
  const agentName = generateName('0x1234567890123456789012345678901234567890');

  return (
    <Flex gap={8} align="center">
      <Jazzicon
        diameter={32}
        seed={Number('0x1234567890123456789012345678901234567890')}
      />
      <Flex vertical>
        <Typography.Text strong>{agentName}</Typography.Text>
        <Typography.Text
          type="secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Modius agent{' '}
          {/* TODO: Add tooltip once copy created
          <Tooltip>
            <InfoCircleOutlined size={16} />
          </Tooltip> 
          */}
        </Typography.Text>
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
        padding: '12px 24px',
        borderBottom: '1px solid #DFE5EE',
      }}
    >
      <AgentBranding />
      <AgentIdentity />
    </Flex>
  );
}
