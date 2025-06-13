import { InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Flex, Skeleton, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import Jazzicon from 'react-jazzicon';

import { COLOR } from '../constants/colors';
import { usePortfolio } from '../hooks/usePortfolio';
import { agentName, agentType } from '../utils/agentMap';
import { generateName } from '../utils/generateAgentName';

const { Text } = Typography;

const AgentBranding = () => {
  return (
    <Flex gap={8} align="center">
      <img src={`/logos/${agentType}.png`} alt="Agent Branding" style={{ width: 40, height: 40 }} />
      <Flex vertical gap={0} style={{ fontSize: 14 }}>
        <Text strong>{agentName}</Text>
        <Text type="secondary">Agent economy</Text>
      </Flex>
    </Flex>
  );
};

const AgentIdentity = () => {
  const { data, isLoading } = usePortfolio();

  const agentDisplayName: string | null = useMemo(() => {
    if (isLoading) return null;
    if (data && data.address) return generateName(data.address);
    return null;
  }, [data, isLoading]);

  const agentAvatar = useMemo(() => {
    if (agentDisplayName) {
      //  @ts-expect-error TODO: To be fixed
      return <Jazzicon diameter={32} seed={Number(data?.address)} />;
    }
    return <Avatar size={32} />;
  }, [agentDisplayName, data?.address]);

  return (
    <Flex gap={8} align="center">
      {agentAvatar}
      <Flex vertical>
        {agentDisplayName ? (
          <Text strong>{agentDisplayName}</Text>
        ) : (
          <Skeleton.Input active={isLoading} style={{ height: 20 }} />
        )}
        <Flex>
          <Text type="secondary">{`${agentName} Agent`}</Text>
          <Tooltip
            title={`Your ${agentName} agent’s strategy sets the threshold parameters that guide its investment decisions. Each strategy comes with a predefined set of thresholds that shape your agent’s activity.`}
            placement="bottomRight"
          >
            <InfoCircleOutlined style={{ color: COLOR.grey, cursor: 'pointer', marginLeft: 4 }} />
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const Navbar = () => (
  <Flex
    justify="space-between"
    style={{
      height: 68,
      minHeight: 68,
      padding: '0 24px',
      borderBottom: `1px solid ${COLOR.lightGrey}`,
    }}
  >
    <AgentBranding />
    <AgentIdentity />
  </Flex>
);
