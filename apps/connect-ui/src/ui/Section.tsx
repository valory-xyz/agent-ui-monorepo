import { ReactNode } from 'react';
import styled from 'styled-components';

import { COLOR } from '../constants/theme';

const StyledSection = styled.section`
  padding: 24px 28px;
`;

// Section title — 16px / 450 / 24px, primary text color.
const Title = styled.h2`
  margin: 0 0 4px;
  font-weight: 450;
  font-size: 16px;
  line-height: 24px;
  color: ${COLOR.TEXT_PRIMARY};
`;

// Hint below the title — 14px / 400 / 20px, rgba(97, 112, 132, 1).
const Description = styled.p`
  margin: 0;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_TERTIARY};

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`;

type SectionProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export const Section = ({ title, description, children }: SectionProps) => (
  <StyledSection>
    <Title>{title}</Title>
    <Description>{description}</Description>
    {children}
  </StyledSection>
);
