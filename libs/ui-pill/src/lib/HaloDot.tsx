import styled from 'styled-components';

type HaloDotProps = {
  /** Diameter of the inner dot (px) */
  size?: number;
  /** Halo diameter = size * haloScale */
  haloScale?: number;
  /** Inner dot color */
  dotColor: string;
  /** Outer halo color */
  haloColor?: string;
};

const Dot = styled.div<Required<HaloDotProps>>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  background: ${({ dotColor }) => dotColor};

  /* the bigger circle outside */
  &::before {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: ${({ size, haloScale }) => size * haloScale}px;
    height: ${({ size, haloScale }) => size * haloScale}px;
    transform: translate(-50%, -50%);
    border-radius: 50%;

    /* solid halo circle */
    background: ${({ haloColor }) => haloColor};
    opacity: ${({ haloColor, dotColor }) => (haloColor === dotColor ? 0.25 : 0.9)};
    pointer-events: none;
    z-index: -1;
  }
`;

export const HaloDot = ({ size = 6, haloScale = 2, dotColor, haloColor }: HaloDotProps) => {
  return (
    <Dot size={size} haloScale={haloScale} dotColor={dotColor} haloColor={haloColor ?? dotColor} />
  );
};
