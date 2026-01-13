import { UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';
import { ClockCircleOutlined, ExportOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Card as AntdCard,
  Col,
  Collapse,
  Flex,
  Modal as AntdModal,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { ReactNode } from 'react';
import styled from 'styled-components';

import { CURRENCY, CurrencyCode } from '../../../constants/currency';
import { TRADING_TYPE_MAP } from '../../../constants/textMaps';
import { COLOR } from '../../../constants/theme';
import { PREDICT_APP_URL } from '../../../constants/urls';
import { usePositionDetails } from '../../../hooks/useBetHistory';
import { BetDetails } from '../../../types';
import { BetStatus } from '../BetStatus';

const { Text } = Typography;

const Modal = styled(AntdModal)`
  .ant-modal-content {
    border-radius: 16px;
    border: 1px solid ${COLOR.WHITE_TRANSPARENT_10};
    background: ${COLOR.MODAL_BACKGROUND};
    box-shadow:
      0 141px 40px 0 rgba(0, 0, 0, 0),
      0 90px 36px 0 rgba(0, 0, 0, 0.03),
      0 51px 30px 0 rgba(0, 0, 0, 0.1),
      0 23px 23px 0 rgba(0, 0, 0, 0.17),
      0 6px 12px 0 rgba(0, 0, 0, 0.2);
  }
`;

const Card = styled(AntdCard)`
  background: ${COLOR.BLACK_TRANSPARENT_20};
  border-radius: 12px;
  border-color: ${COLOR.WHITE_TRANSPARENT_10};
`;

const BetInfoFlex = styled(Flex)<{ noBorder?: boolean }>`
  margin-left: 24px;
  padding: 8px 0;
  ${(props) => !props.noBorder && `border-bottom: 1px solid ${COLOR.WHITE_TRANSPARENT_10};`}
`;

const formatCurrency = (n: number, currency: CurrencyCode) => {
  const currencySymbol = CURRENCY[currency]?.symbol || '$';
  return `${currencySymbol}${n.toFixed(2)}`;
};

const formatPlacedAt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const Metric = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <Flex vertical gap={4}>
    {typeof label === 'string' ? (
      <Text type="secondary" className="text-sm">
        {label}
      </Text>
    ) : (
      label
    )}
    <div>{typeof value === 'string' ? <Text className="text-md">{value}</Text> : value}</div>
  </Flex>
);

type BetInfoProps = { title: string; tooltip?: string; desc: ReactNode; noBorder?: boolean };
const BetInfo = ({ title, tooltip, desc, noBorder }: BetInfoProps) => (
  <BetInfoFlex gap={4} noBorder={noBorder}>
    <Text type="secondary" style={{ width: 180 }}>
      {title}
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined style={{ color: COLOR.WHITE_TRANSPARENT_50, marginLeft: 8 }} />
        </Tooltip>
      )}
    </Text>
    <Text>{desc}</Text>
  </BetInfoFlex>
);

const Bet = ({ bet, intelligence, strategy }: BetDetails) => {
  return (
    <Flex vertical>
      <BetInfo title="Strategy" desc={`${TRADING_TYPE_MAP[strategy].displayName}`} />

      <BetInfo
        title="Prediction tool"
        desc={`${intelligence.prediction_tool}`}
        tooltip="The tool the agent used to research and generate its prediction for this market."
      />

      <BetInfo
        title="Intelligence"
        desc={
          <Flex vertical gap={8}>
            <Text>
              {Math.round(intelligence.implied_probability * 100)}%{' '}
              <Text type="secondary">Implied probability</Text>
            </Text>
            <Text className="text-md">
              {Math.round(intelligence.confidence_score * 100)}%{' '}
              <Text type="secondary">Confidence score</Text>
            </Text>
            <Text className="text-md">
              {Math.round(intelligence.utility_score * 100)}%{' '}
              <Text type="secondary">Utility score</Text>
            </Text>
          </Flex>
        }
        tooltip="The tool the agent used to research and generate its prediction for this market."
        noBorder={bet.placed_at ? false : true}
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

type PositionDetailsModalProps = {
  id: string;
  onClose: () => void;
};

export const PositionDetailsModal = ({ id, onClose }: PositionDetailsModalProps) => {
  const { data, isLoading, error } = usePositionDetails({ id });

  return (
    <Modal
      title={<Text className="font-lg">Position details</Text>}
      open
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      styles={{
        header: { background: 'transparent' },
        body: { paddingTop: 16 },
        content: { maxHeight: '70vh', overflowY: 'auto' },
      }}
    >
      {isLoading ? (
        <Card>
          <Skeleton active title={false} paragraph={{ rows: 3 }} />
        </Card>
      ) : error ? (
        <Alert type="error" description={error.message} showIcon />
      ) : data ? (
        <>
          <Card variant="outlined" className="mb-8" styles={{ body: { padding: 16 } }}>
            <Text>
              <a
                href={`${PREDICT_APP_URL}/questions/${data.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open market"
                style={{ color: COLOR.WHITE_TRANSPARENT_75, marginBottom: 8 }}
              >
                {data.question} {UNICODE_SYMBOLS.EXTERNAL_LINK}
              </a>
            </Text>

            <Row gutter={[16, 16]} className="mt-16">
              <Col xs={24} sm={8} md={8}>
                <Metric label="Total bet" value={formatCurrency(data.total_bet, data.currency)} />
              </Col>
              <Col xs={24} sm={8} md={8}>
                <Metric label="To win" value={formatCurrency(data.to_win, data.currency)} />
              </Col>
              <Col xs={24} sm={8} md={8}>
                <Metric
                  label="Status"
                  value={
                    <Flex gap={8} align="center" style={{ width: 'max-content' }}>
                      <BetStatus
                        currency={data.currency}
                        status={data.status}
                        remaining_seconds={data.remaining_seconds}
                        bet_amount={data.total_bet}
                        net_profit={data.net_profit}
                        styles={{ fontSize: '105%' }}
                        extra={
                          <ClockCircleOutlined style={{ color: COLOR.WHITE_TRANSPARENT_75 }} />
                        }
                      />
                    </Flex>
                  }
                />
              </Col>
            </Row>
          </Card>

          <div>
            {data.bets?.length ? (
              <Collapse
                ghost
                items={data.bets.map(({ id, bet, intelligence, strategy }, idx) => {
                  const sideLabel = bet.side === 'yes' ? 'Yes' : 'No';
                  return {
                    key: id,
                    label: (
                      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <Text className="text-md">Bet {idx + 1}</Text>
                        <Flex align="center" gap={8}>
                          <Text className="text-md">
                            {formatCurrency(bet.amount, data.currency)} {sideLabel}
                          </Text>
                          {bet.external_url && (
                            <a
                              href={bet.external_url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Open market"
                              style={{ color: COLOR.WHITE_TRANSPARENT_75 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExportOutlined />
                            </a>
                          )}
                        </Flex>
                      </Flex>
                    ),
                    children: (
                      <Bet id={data.id} bet={bet} intelligence={intelligence} strategy={strategy} />
                    ),
                  };
                })}
                style={
                  {
                    // background: COLOR.BLACK_TRANSPARENT_20,
                    // borderRadius: 12,
                    // border: `1px solid ${COLOR.WHITE_TRANSPARENT_10}`,
                  }
                }
              />
            ) : (
              <Flex justify="center" align="center" style={{ height: 100 }}>
                <Text>No bets found.</Text>
              </Flex>
            )}
          </div>
        </>
      ) : null}
    </Modal>
  );
};
