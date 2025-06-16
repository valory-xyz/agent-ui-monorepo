import styled from 'styled-components';

export const NavBarContainer = styled.div`
  height: 74px;
  backdrop-filter: blur(10px);

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
