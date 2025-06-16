import styled from 'styled-components';
import { CHART_HEIGHT } from '../../constants/sizes';

export const NoDataContainer = styled.div`
  display: flex;
  max-height: ${CHART_HEIGHT}px;
  height: 100%;
  align-items: center;
  justify-content: center;
`;
