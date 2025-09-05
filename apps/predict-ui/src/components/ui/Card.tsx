import { Card as AntdCard } from 'antd';
import styled, { css } from 'styled-components';

import { COLOR } from '../../constants/theme';

const cardBeforeStyles = css`
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/card.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.5;
  z-index: 1;
`;

export const Card = styled.div<{ $padding?: string }>`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 32px;
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

export const CardV2 = styled(AntdCard)`
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
    ${cardBeforeStyles}
    border-radius: 16px;
  }

  & > * {
    position: relative;
    z-index: 2;
  }
`;
