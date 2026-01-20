import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Tooltip, Typography } from 'antd';
import { ReactNode } from 'react';
import styled from 'styled-components';

import { TRADING_TYPE_MAP } from '../../../constants/textMaps';
import { COLOR } from '../../../constants/theme';
import { BetDetails } from '../../../types';

const { Text } = Typography;

const BetInfoFlex = styled(Flex)<{ noBorder?: boolean; borderTop?: boolean }>`
  margin-left: 24px;
  padding: 8px 0;
  ${(props) => !props.noBorder && `border-bottom: 1px solid ${COLOR.WHITE_TRANSPARENT_10};`}
  ${(props) => props.borderTop && `border-top: 1px solid ${COLOR.WHITE_TRANSPARENT_10};`}
`;

const formatPlacedAt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const intelligenceTooltipItems = [
  {
    label: 'Implied probability',
    description: "The agent's estimated likelihood for the market's outcome.",
  },
  {
    label: 'Confidence score',
    description: 'How certain the agent is about its estimate.',
  },
  {
    label: 'Utility score',
    description: "How informative the agent's research was for making this estimate.",
  },
];

const IntelligenceTooltip = () => (
  <Flex vertical gap={8}>
    <Text className="text-sm">How the agent evaluated this market when the bet was placed:</Text>
    <ul style={{ paddingLeft: 12 }}>
      {intelligenceTooltipItems.map((item) => (
        <li key={item.label}>
          <Text className="text-sm">
            <b>{item.label}</b>: {item.description}
          </Text>
        </li>
      ))}
    </ul>
  </Flex>
);

type BetInfoProps = {
  title: string;
  tooltip?: ReactNode;
  desc: ReactNode;
  noBorder?: boolean;
  borderTop?: boolean;
};
const BetInfo = ({ title, tooltip, desc, noBorder, borderTop }: BetInfoProps) => (
  <BetInfoFlex noBorder={noBorder} borderTop={borderTop}>
    <Text type="secondary" style={{ width: 180 }}>
      {title}
      {tooltip && (
        <Tooltip title={tooltip} placement="topLeft" styles={{ root: { maxWidth: 340 } }}>
          <InfoCircleOutlined style={{ color: COLOR.WHITE_TRANSPARENT_50, marginLeft: 8 }} />
        </Tooltip>
      )}
    </Text>
    <Text>{desc}</Text>
  </BetInfoFlex>
);

export const Bet = ({ bet, intelligence, strategy, isLast }: BetDetails & { isLast?: boolean }) => {
  return (
    <Flex vertical style={isLast ? {} : { marginBottom: 20 }}>
      {strategy && (
        <BetInfo
          title="Strategy"
          desc={`${TRADING_TYPE_MAP[strategy].displayName}`}
          borderTop={true}
        />
      )}

      <BetInfo
        title="Prediction tool"
        desc={`${intelligence.prediction_tool}`}
        tooltip="The tool the agent used to research and generate its prediction for this market."
        borderTop={!strategy}
      />

      <BetInfo
        title="Intelligence"
        desc={
          <Flex vertical gap={8}>
            <Text>
              {Math.round(intelligence.implied_probability)}%{' '}
              <Text type="secondary">Implied probability</Text>
            </Text>
            <Text className="text-md">
              {Math.round(intelligence.confidence_score)}%{' '}
              <Text type="secondary">Confidence score</Text>
            </Text>
            <Text className="text-md">
              {Math.round(intelligence.utility_score)}% <Text type="secondary">Utility score</Text>
            </Text>
          </Flex>
        }
        tooltip={<IntelligenceTooltip />}
        noBorder={!bet.placed_at}
      />

      {bet.placed_at && (
        <BetInfoFlex noBorder={true}>
          <Text type="secondary" className="text-sm">
            {formatPlacedAt(bet.placed_at)}
          </Text>
        </BetInfoFlex>
      )}
    </Flex>
  );
};
