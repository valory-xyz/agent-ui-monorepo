import { Flex, Typography } from 'antd';
import { CSSProperties, useMemo } from 'react';
import modiusLogo from '../assets/agent-modius-logo.png';
import optimusLogo from '../assets/agent-optimus-logo.png';
import { generateAgentName } from '../utils/generateAgentName';

const { Title, Text } = Typography;

const style: CSSProperties = {
  padding: '12px 24px',
  boxShadow:
    '0px 6px 16px 0px rgba(43, 61, 105, 0.08), 0px 3px 6px -4px rgba(44, 61, 104, 0.12), 0px 9px 28px 8px rgba(44, 61, 104, 0.05)',
  backgroundColor: 'transparent',
};

type NavContentProps = { imgUrl: string | null; title: string; description: string };

const NavContent = ({ imgUrl, title, description }: NavContentProps) => {
  return (
    <Flex align="center" gap={8}>
      <Flex>
        {imgUrl ? <img src={imgUrl} alt={title} style={{ width: '40px', height: '40px' }} /> : null}
      </Flex>
      <Flex vertical align="start">
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        <Text type="secondary">{description}</Text>
      </Flex>
    </Flex>
  );
};

type NavbarProps = { agentType: string; userName: string }; // TODO: convert to agentType

export function Navbar({ agentType, userName }: NavbarProps) {
  const { imgUrls, agentDetails, userDetails } = useMemo(() => {
    switch (agentType) {
      case 'modius':
        return {
          imgUrls: { agent: modiusLogo, user: modiusLogo }, // TODO: user image
          agentDetails: { agent: 'Modius', desc: 'Agent Economy' },
          userDetails: { desc: 'Modius agent' },
        };
      case 'optimus':
        return {
          imgUrls: { agent: optimusLogo, user: optimusLogo }, // TODO: user image
          agentDetails: { agent: 'Optimus', desc: 'Agent Economy' },
          userDetails: { desc: 'Optimus agent' },
        };
      default:
        throw new Error('Unsupported agent type');
    }
  }, [agentType]);

  const userDisplayName = generateAgentName(userName);
  // TODO: icon to be added for user

  return (
    <Flex justify="space-between" align="middle" style={style}>
      <NavContent
        imgUrl={imgUrls.agent}
        title={agentDetails.agent}
        description={agentDetails.desc}
      />
      <NavContent imgUrl={imgUrls.user} title={userDisplayName} description={userDetails.desc} />
    </Flex>
  );
}

export default Navbar;
