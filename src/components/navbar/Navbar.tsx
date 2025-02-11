import { Flex } from 'antd';
import React from 'react';

export const AgentBranding = () => {
  return (
    <Flex gap={8}>
      <img
        src="/logos/modius.png"
        alt="Agent Branding"
        style={{ width: 40, height: 40 }}
      />
      <Flex vertical gap={4} style={{ fontSize: 14 }}>
        <strong>Modius</strong>
        <span>Agent economy</span>
      </Flex>
    </Flex>
  );
};

export const AgentIdentity = () => {
  return (
    <Flex vertical>
      <span>Agent ID</span>
      <span>Agent Email</span>
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
