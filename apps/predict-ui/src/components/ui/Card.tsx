import styled from 'styled-components';

import { COLOR } from '../../constants/theme';

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid ${COLOR.WHITE_TRANSPARENT_10};
  position: relative;
  overflow: hidden;

  &::before {
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
  }

  & > * {
    position: relative;
    z-index: 2;
  }
`;
