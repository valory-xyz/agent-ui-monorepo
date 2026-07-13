import { Typography } from 'antd';
import { ReactNode } from 'react';
import styled from 'styled-components';

const { Text, Title } = Typography;

const StyledSection = styled.section`
  padding: 24px 28px;
`;

const Description = styled(Text)`
  display: block;
  margin-bottom: 16px;
`;

type SectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export const Section = ({ title, description, children }: SectionProps) => (
  <StyledSection>
    <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
      {title}
    </Title>
    <Description type="secondary">{description}</Description>
    {children}
  </StyledSection>
);
