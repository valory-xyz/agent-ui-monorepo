import { UNICODE_SYMBOLS } from '@agent-ui-monorepo/util-constants-and-types';
import { ClockCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Card as AntdCard,
  Col,
  Collapse,
  Flex,
  Modal as AntdModal,
  Row,
  Skeleton,
  Typography,
} from 'antd';
import { ReactNode } from 'react';
import styled from 'styled-components';

import { CURRENCY, CurrencyCode } from '../../../constants/currency';
import { COLOR } from '../../../constants/theme';
import { PREDICT_APP_URL } from '../../../constants/urls';
import { usePositionDetails } from '../../../hooks/useBetHistory';
import { BetStatus } from '../BetStatus';
import { Bet } from './Bet';

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

          {data.bets?.length ? (
            <Collapse
              defaultActiveKey={[data.bets[0]?.id]}
              items={data.bets.map(({ id, bet, intelligence, strategy }, idx) => {
                const sideLabel = bet.side === 'yes' ? 'Yes' : 'No';
                const isLast = idx === data.bets.length - 1;
                const hasOneBet = data.bets.length === 1;
                return {
                  key: id,
                  label: (
                    <Flex align="center" style={{ width: '100%' }}>
                      <Text type="secondary" style={{ width: 180 }}>
                        {`Bet ${hasOneBet ? '' : idx + 1}`}
                      </Text>
                      <Flex align="center" gap={8}>
                        <Text>{formatCurrency(bet.amount, data.currency)}</Text>
                        <Text type="secondary">{sideLabel}</Text>
                      </Flex>
                    </Flex>
                  ),
                  children: (
                    <Bet
                      id={data.id}
                      bet={bet}
                      intelligence={intelligence}
                      strategy={strategy}
                      isLast={isLast}
                    />
                  ),
                  styles: { body: { paddingTop: 0, paddingBottom: isLast ? 0 : 20 } },
                  style: isLast
                    ? undefined
                    : { borderBottom: `1px solid ${COLOR.WHITE_TRANSPARENT_10}` },
                };
              })}
              ghost
            />
          ) : (
            <Flex justify="center" align="center" style={{ height: 100 }}>
              <Text>No bets found.</Text>
            </Flex>
          )}
        </>
      ) : null}
    </Modal>
  );
};
