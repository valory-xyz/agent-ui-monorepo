import { Typography } from 'antd';
import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import styled from 'styled-components';

import { Card } from './ui/Card';

const { Title, Paragraph } = Typography;

const StyledCard = styled(Card)`
  margin: auto 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 350px;
  align-items: center;
  align-self: center;
  padding: 24px;

  > svg {
    margin-bottom: 16px;
  }
`;

type IconType = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

type ErrorStateProps = {
  title: string;
  description: string;
  icon: IconType;
};

const GradientIcon = ({ size, Icon }: { size: number; Icon: IconType }) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
    <Icon size={size} stroke="url(#gradient)" />
    <defs>
      <linearGradient
        id="gradient"
        x1="50%"
        y1="0"
        x2="50%"
        y2="35%"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="white" />
        <stop offset="80%" stopColor="#BFBFBF" />
      </linearGradient>
    </defs>
  </svg>
);

export const ErrorState = ({ title, description, icon }: ErrorStateProps) => {
  return (
    <StyledCard>
      <Content>
        <GradientIcon size={80} Icon={icon} />
        <Title level={4} className="m-0">
          {title}
        </Title>
        <Paragraph type="secondary" className="text-center">
          {description}
        </Paragraph>
      </Content>
    </StyledCard>
  );
};
