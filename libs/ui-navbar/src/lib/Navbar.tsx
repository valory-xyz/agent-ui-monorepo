import { generateAgentName } from '@agent-ui-monorepo/util-functions';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Flex, Skeleton, Tooltip, Typography } from 'antd';
import { CSSProperties, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import agentsFun from '../assets/agent-agentsfun-logo.png';
import modiusLogo from '../assets/agent-modius-logo.png';
import optimusLogo from '../assets/agent-optimus-logo.png';
import traderLogo from '../assets/agent-predict-logo.png';

const { Title, Text } = Typography;

const style: CSSProperties = {
  padding: '12px 24px',
  boxShadow:
    '0px 6px 16px 0px rgba(43, 61, 105, 0.08), 0px 3px 6px -4px rgba(44, 61, 104, 0.12), 0px 9px 28px 8px rgba(44, 61, 104, 0.05)',
  background: 'transparent',
};

// TODO: move to util-functions-and-types folder
const AgentTypes = {
  modius: 'modius',
  optimus: 'optimus',
  trader: 'trader',
  agentsFun: 'agentsFun',
} as const;

type AgentType = (typeof AgentTypes)[keyof typeof AgentTypes];

const useAgentType = (agentType: string) =>
  useMemo(() => {
    switch (agentType) {
      case AgentTypes.modius:
        return {
          agentLogo: modiusLogo,
          agentDetails: { agent: 'Modius', desc: 'Agent Economy' },
          userDetails: {
            desc: 'Modius agent',
            tooltip:
              'Your Modius agent’s strategy sets the threshold parameters that guide its investment decisions. Each strategy comes with a predefined set of thresholds that shape your agent’s activity.',
          },
        };
      case AgentTypes.optimus:
        return {
          agentLogo: optimusLogo,
          agentDetails: { agent: 'Optimus', desc: 'Agent Economy' },
          userDetails: {
            desc: 'Optimus agent',
            tooltip:
              'Your Optimus agent’s strategy sets the threshold parameters that guide its investment decisions. Each strategy comes with a predefined set of thresholds that shape your agent’s activity.',
          },
        };
      case AgentTypes.trader:
        return {
          agentLogo: traderLogo,
          agentDetails: { agent: 'Predict', desc: 'Agent Economy' },
          userDetails: { desc: 'Predict agent' },
        };
      case AgentTypes.agentsFun:
        return {
          agentLogo: agentsFun,
          agentDetails: { agent: 'Agents.fun', desc: 'Agent Economy' },
          userDetails: { desc: 'Agents.fun agent' },
        };
      default:
        throw new Error('Unsupported agent type');
    }
  }, [agentType]);

type NavbarProps = {
  isLoading?: boolean;
  agentType: AgentType;
  userAddress?: string;
};

export const Navbar = ({ isLoading, agentType, userAddress }: NavbarProps) => {
  const { agentLogo, agentDetails, userDetails } = useAgentType(agentType);

  const agentAvatar = useMemo(() => {
    if (userAddress) {
      return <Jazzicon diameter={32} seed={jsNumberForAddress(userAddress)} />;
    }
    return <Avatar size={32} />;
  }, [userAddress]);

  return (
    <Flex justify="space-between" align="middle" style={style}>
      <Flex align="center" gap={8}>
        <Flex>
          <img
            src={agentLogo}
            alt={`${agentType} logo`}
            style={{ width: '40px', height: '40px' }}
          />
        </Flex>
        <Flex vertical align="start">
          <Title level={5} style={{ margin: 0 }}>
            {agentDetails.agent}
          </Title>
          <Text type="secondary" className="text-sm">
            {agentDetails.desc}
          </Text>
        </Flex>
      </Flex>

      <Flex align="center" gap={8}>
        <Flex>{agentAvatar}</Flex>
        <Flex vertical align="start">
          {isLoading ? (
            <Skeleton.Input
              active
              style={{ height: 20, marginBottom: 4, width: 110, minWidth: 110 }}
            />
          ) : (
            <Title level={5} style={{ margin: 0 }}>
              {userAddress ? generateAgentName(userAddress) : ''}
            </Title>
          )}
          <Flex gap={4}>
            <Text type="secondary" className="text-sm">
              {userDetails.desc}
            </Text>
            {userDetails.tooltip && (
              <Tooltip title={userDetails.tooltip} placement="bottomRight">
                <InfoCircleOutlined
                  style={{
                    //  TODO: use from COLORS
                    color: '#ADB5BD',
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
