import { Card as AntdCard } from 'antd';
import styled, { css } from 'styled-components';

import { COLOR } from '../../constants/theme';
import { isTraderAgent } from '../../utils/agentMap';

const cardBeforeStyles = ({ hasBackgroundImage }: { hasBackgroundImage?: boolean }) => css`
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${hasBackgroundImage ? "url('/images/card.png')" : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.5;
  z-index: 1;
  background-color: ${hasBackgroundImage ? 'transparent' : COLOR.CARD_BACKGROUND};
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
    ${() => cardBeforeStyles({ hasBackgroundImage: isTraderAgent })}
  }

  & > * {
    position: relative;
    z-index: 2;
  }
`;

/**
 * A variant of Card with slightly different styles (used for predict ui Chat)
 */
export const CardV2 = styled(AntdCard)<{ $hasBackgroundImage?: boolean }>`
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid ${COLOR.WHITE_TRANSPARENT_10};
  background: transparent;

  .agent-chat-input {
    background: ${COLOR.WHITE_TRANSPARENT_10};
    backdrop-filter: blur(4px);
    textarea {
      background: transparent;
    }
  }

  &::before {
    ${({ $hasBackgroundImage = true }) =>
      cardBeforeStyles({ hasBackgroundImage: $hasBackgroundImage })}
    border-radius: 16px;
  }

  & > * {
    position: relative;
    z-index: 2;
  }
`;
