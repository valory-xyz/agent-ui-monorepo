import styled, { css } from 'styled-components';

import { COLOR } from '../../constants/theme';
import { isOmenstratAgent } from '../../utils/agentMap';

const cardBeforeStyles = css`
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${isOmenstratAgent ? "url('/images/card.png')" : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.5;
  z-index: 1;
  background-color: ${isOmenstratAgent ? 'transparent' : COLOR.CARD_BACKGROUND};
`;

export const Card = styled.div<{ $padding?: string; $gap?: string }>`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap || '32px'};
  padding: ${({ $padding }) => $padding || '32px'};
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid ${COLOR.WHITE_TRANSPARENT_10};
  &::before {
    ${cardBeforeStyles}
  }

  & > * {
    position: relative;
    z-index: 2;
  }
`;
