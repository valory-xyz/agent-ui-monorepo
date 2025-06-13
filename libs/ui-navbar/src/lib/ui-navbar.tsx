import { Flex, Typography, Avatar } from 'antd';
import { CSSProperties, ReactNode, useMemo } from 'react';
import modiusLogo from '../assets/agent-modius-logo.png';
import optimusLogo from '../assets/agent-optimus-logo.png';
import traderLogo from '../assets/agent-predict-logo.png';
import { generateAgentName } from '@agent-ui-monorepo/util-functions';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

const { Title, Text } = Typography;

const style: CSSProperties = {
  padding: '12px 24px',
  boxShadow:
    '0px 6px 16px 0px rgba(43, 61, 105, 0.08), 0px 3px 6px -4px rgba(44, 61, 104, 0.12), 0px 9px 28px 8px rgba(44, 61, 104, 0.05)',
  backgroundColor: 'transparent',
};

type NavContentProps = { icon: ReactNode; title: string; description: string };

const NavContent = ({ icon, title, description }: NavContentProps) => {
  return (
    <Flex align="center" gap={8}>
      <Flex>{icon ? icon : null}</Flex>
      <Flex vertical align="start">
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        <Text type="secondary">{description}</Text>
      </Flex>
    </Flex>
  );
};

type NavbarProps = { agentType: string; userAddress: string }; // TODO: convert to agentType

export function Navbar({ agentType, userAddress }: NavbarProps) {
  const { agentLogo, agentDetails, userDetails } = useMemo(() => {
    switch (agentType) {
      case 'modius':
        return {
          agentLogo: modiusLogo,
          agentDetails: { agent: 'Modius', desc: 'Agent Economy' },
          userDetails: { desc: 'Modius agent' },
        };
      case 'optimus':
        return {
          agentLogo: optimusLogo,
          agentDetails: { agent: 'Optimus', desc: 'Agent Economy' },
          userDetails: { desc: 'Optimus agent' },
        };
      case 'trader':
        return {
          agentLogo: traderLogo,
          agentDetails: { agent: 'Predict', desc: 'Agent Economy' },
          userDetails: { desc: 'Predict agent' },
        };
      default:
        throw new Error('Unsupported agent type');
    }
  }, [agentType]);

  const userDisplayName = generateAgentName(userAddress);
  const agentAvatar = useMemo(() => {
    if (userDisplayName) {
      // @ts-expect-error TODO
      return <Jazzicon diameter={32} seed={jsNumberForAddress(userAddress)} />;
    }
    return <Avatar size={32} />;
  }, [userDisplayName, userAddress]);

  return (
    <Flex justify="space-between" align="middle" style={style}>
      <NavContent
        icon={
          <img
            src={agentLogo}
            alt={`${agentType} logo`}
            style={{ width: '40px', height: '40px' }}
          />
        }
        title={agentDetails.agent}
        description={agentDetails.desc}
      />
      <NavContent icon={agentAvatar} title={userDisplayName} description={userDetails.desc} />
    </Flex>
  );
}

export default Navbar;
