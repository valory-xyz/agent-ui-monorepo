import { NA, UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';
import { ClockCircleOutlined, ExportOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Card as AntdCard,
  Col,
  Flex,
  Modal as AntdModal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

import { CURRENCY, CurrencyCode } from '../../constants/currency';
import { TRADING_TYPE_MAP } from '../../constants/textMaps';
import { COLOR } from '../../constants/theme';
import { PREDICT_APP_URL } from '../../constants/urls';
import { useBetDetails } from '../../hooks/useBetHistory';
import { BetDetails } from '../../types';
import { BetStatus } from './BetStatus';

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

const PetitionDetailsError = ({ errorMessage }: { errorMessage: string }) => (
  <Alert type="error" description={errorMessage} showIcon />
);

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

const Bet = ({ bet, probability, strategy, currency }: BetDetails & { currency: CurrencyCode }) => {
  const sideLabel = bet.side === 'yes' ? 'Yes' : 'No';

  return (
    <React.Fragment>
      <Col xs={24} sm={8} md={8}>
        <Flex vertical gap={6}>
          <Text type="secondary" className="text-sm">
            Bet
          </Text>

          <Flex align="baseline" gap={8}>
            <Text>
              {formatCurrency(bet.amount, currency)} – {sideLabel}
            </Text>

            {bet.external_url && (
              <a
                href={bet.external_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open market"
                style={{ color: COLOR.WHITE_TRANSPARENT_75, marginBottom: 8 }}
              >
                <ExportOutlined />
              </a>
            )}
          </Flex>

          <Text type="secondary" className="text-xs">
            {bet.placed_at ? formatPlacedAt(bet.placed_at) : ''}
          </Text>
        </Flex>
      </Col>

      <Col xs={24} sm={8} md={8}>
        <Metric
          label="Probability"
          value={Number.isFinite(probability) ? `${Math.round(probability)}%` : NA}
        />
      </Col>

      <Col xs={24} sm={8} md={8}>
        <Metric
          label={
            <Space align="center">
              <Text type="secondary" className="text-sm">
                Strategy
              </Text>
              <Tooltip title="Betting strategy at the time this bet was placed">
                <InfoCircleOutlined style={{ color: COLOR.WHITE_TRANSPARENT_75 }} />
              </Tooltip>
            </Space>
          }
          value={
            <Tag
              bordered={false}
              color={COLOR.WHITE_TRANSPARENT_5}
              style={{ color: COLOR.WHITE_TRANSPARENT_75, fontSize: 14 }}
            >
              {TRADING_TYPE_MAP[strategy].displayName}
            </Tag>
          }
        />
      </Col>
    </React.Fragment>
  );
};

type PositionDetailsModalProps = {
  id: string;
  onClose: () => void;
};

export const PositionDetailsModal = ({ id, onClose }: PositionDetailsModalProps) => {
  const { data, isLoading, error } = useBetDetails({ id });

  return (
    <Modal
      title={<Text className="font-lg">Position details</Text>}
      open
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      styles={{ header: { background: 'transparent' }, body: { paddingTop: 16 } }}
    >
      {isLoading ? (
        <Card>
          <Skeleton active title={false} paragraph={{ rows: 3 }} />
        </Card>
      ) : error ? (
        <PetitionDetailsError errorMessage={error.message} />
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
              data.bets.map(({ id, bet, probability, strategy }, idx) => {
                const isLast = idx === data.bets.length - 1;

                return (
                  <React.Fragment key={id}>
                    <Row
                      gutter={[16, 16]}
                      style={{
                        borderBottom: isLast ? 'none' : `1px solid ${COLOR.WHITE_TRANSPARENT_10}`,
                        padding: 16,
                      }}
                    >
                      <Bet
                        id={data.id}
                        bet={bet}
                        probability={probability}
                        strategy={strategy}
                        currency={data.currency}
                      />
                    </Row>
                  </React.Fragment>
                );
              })
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
