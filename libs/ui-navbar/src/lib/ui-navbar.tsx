import { Flex, Typography } from 'antd';
import { CSSProperties } from 'react';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledUiNavbar = styled.div`
  color: pink;
`;

const style: CSSProperties = {
  padding: '12px 24px',
  boxShadow:
    '0px 6px 16px 0px rgba(43, 61, 105, 0.08), 0px 3px 6px -4px rgba(44, 61, 104, 0.12), 0px 9px 28px 8px rgba(44, 61, 104, 0.05)',
  backgroundColor: 'transparent',
};

type NavContentProps = { imgUrl: string; title: string; description: string };
const NavContent = ({ imgUrl, title, description }: NavContentProps) => (
  <Flex align="center" gap={8}>
    <Flex>
      <Text>{imgUrl}</Text>
      {/* TODO */}
      {/* <img src={imgUrl} alt={title} style={{ width: '40px', height: '40px' }} /> */}
    </Flex>
    <Flex vertical align="start" style={{ paddingLeft: '8px' }}>
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      <Text type="secondary">{description}</Text>
    </Flex>
  </Flex>
);

export function Navbar() {
  return (
    <Flex justify="space-between" align="middle" style={style}>
      <NavContent
        imgUrl="path/to/image.jpg"
        title="Agents.fun"
        description="Agent economy"
      />
      <NavContent
        imgUrl="path/to/image.jpg"
        title="fafon-norlo70"
        description="Agents.fun agent"
      />
    </Flex>
  );
}

export default Navbar;
