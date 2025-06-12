import { Flex, Typography } from 'antd';
import { CSSProperties, useMemo } from 'react';
import modiusLogo from '../assets/agent-modius-logo.png';
import optimusLogo from '../assets/agent-optimus-logo.png';

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

type NavbarProps = { agentType: string }; // TODO: convert to agentType

export function Navbar({ agentType }: NavbarProps) {
  const imgUrls = useMemo(() => {
    if (agentType === 'modius') {
      return { agent: modiusLogo, user: modiusLogo }; // TODO: user image
    }

    if (agentType === 'optimus') {
      return { agent: optimusLogo, user: optimusLogo }; // TODO: user image
    }

    throw new Error('Unsupported agent type');
  }, [agentType]);

  const agentDetails = useMemo(() => {
    if (agentType === 'modius') {
      return { agent: 'Modius', desc: 'Agent Economy' };
    } else if (agentType === 'optimus') {
      return { agent: 'Optimus', desc: 'Agent Economy' };
    }

    throw new Error('Unsupported agent type');
  }, [agentType]);

  const userDetails = useMemo(() => {
    if (agentType === 'modius') {
      return { user: 'modius-user', desc: 'Modius agent' };
    } else if (agentType === 'optimus') {
      return { user: 'optimus-user', desc: 'Optimus agent' };
    }

    throw new Error('Unsupported agent type');
  }, [agentType]);

  return (
    <Flex justify="space-between" align="middle" style={style}>
      <NavContent
        imgUrl={imgUrls.agent}
        title={agentDetails.agent}
        description={agentDetails.desc}
      />
      <NavContent imgUrl={imgUrls.user} title={userDetails.user} description={userDetails.desc} />
    </Flex>
  );
}

export default Navbar;
