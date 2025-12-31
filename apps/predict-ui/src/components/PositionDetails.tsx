import { NA } from '@agent-ui-monorepo/util-constants-and-types';
import { ClockCircleOutlined, ExportOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Card as AntdCard,
  Col,
  Divider,
  Modal as AntdModal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { COLOR } from '../constants/theme';
import { useBetDetails } from '../hooks/useBetHistory';

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

const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatPlacedAt(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const PetitionDetailsError = ({ errorMessage }: { errorMessage: string }) => (
  <Alert type="error" description={errorMessage} showIcon />
);

function CardDark({ children }: { children: React.ReactNode }) {
  return (
    <AntdCard
      bordered={false}
      style={{
        background: 'rgba(0,0,0,0.16)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      bodyStyle={{ padding: 16, minHeight: 104 }}
    >
      {children}
    </AntdCard>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Typography.Text style={styles.smallLabel}>{label}</Typography.Text>
      <div style={{ marginTop: 6 }}>
        {typeof value === 'string' ? (
          <Typography.Text style={styles.metricValue}>{value}</Typography.Text>
        ) : (
          <div style={styles.metricValue as React.CSSProperties}>{value}</div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  smallLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  metricValue: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 22,
    fontWeight: 700,
  },
  bigValue: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 20,
    fontWeight: 700,
  },
  subtleText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 6,
    display: 'block',
  },
};

type PositionDetailsModalProps = {
  id: string;
  onClose: () => void;
};

export function PositionDetailsModal({ id, onClose }: PositionDetailsModalProps) {
  const { data, isLoading, error } = useBetDetails({ id });

  const countdownLabel = useMemo(() => {
    if (!data) return '';
    const { status, remainingSeconds } = data;
    if (status === 'pending' && remainingSeconds) {
      return formatDuration(remainingSeconds);
    }
  }, [data]);

  return (
    <Modal
      title={<Text className="font-lg">Position details</Text>}
      open
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      styles={{
        content: {},
        header: { background: 'transparent' },
        body: { paddingTop: 18 },
      }}
    >
      {isLoading ? (
        <CardDark>
          <Skeleton active title={false} paragraph={{ rows: 3 }} />
        </CardDark>
      ) : error ? (
        <PetitionDetailsError errorMessage={error.message} />
      ) : (
        <>
          <Card variant="outlined" className="mb-16" styles={{ body: { padding: 16 } }}>
            <Typography.Paragraph
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: 18,
                lineHeight: 1.35,
                marginBottom: 18,
              }}
            >
              {data?.question ?? NA}
            </Typography.Paragraph>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Metric label="Total bet" value={data ? formatCurrency(data.totalBet) : NA} />
              </Col>
              <Col xs={24} md={8}>
                <Metric label="To win" value={data ? formatCurrency(data.toWin) : NA} />
              </Col>
              <Col xs={24} md={8}>
                <Metric
                  label="Status"
                  value={
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.75)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.92)' }}>
                        {data ? countdownLabel : NA}
                      </span>
                    </span>
                  }
                />
              </Col>
            </Row>
          </Card>

          {/* Bets (multiple) */}
          <Typography.Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            Bets
          </Typography.Text>

          <div style={{ marginTop: 10 }}>
            {data?.bets?.length ? (
              data.bets.map((b, idx) => {
                const sideLabel = b.bet.side === 'yes' ? 'Yes' : 'No';
                const sideTagColor =
                  b.bet.side === 'yes' ? 'rgba(82,196,26,0.25)' : 'rgba(245,34,45,0.25)';
                const sideBorderColor =
                  b.bet.side === 'yes' ? 'rgba(82,196,26,0.45)' : 'rgba(245,34,45,0.45)';

                return (
                  <React.Fragment key={`${data.id}-${idx}`}>
                    {idx > 0 ? (
                      <Divider
                        style={{
                          margin: '12px 0',
                          borderColor: 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ) : null}

                    <Row gutter={[16, 16]}>
                      {/* Bet */}
                      <Col xs={24} md={8}>
                        <CardDark>
                          <Typography.Text style={styles.smallLabel}>Bet</Typography.Text>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 8,
                              marginTop: 6,
                            }}
                          >
                            <Typography.Text style={styles.bigValue}>
                              {formatCurrency(b.bet.amount)} – {sideLabel}
                            </Typography.Text>

                            <Tag
                              style={{
                                marginLeft: 6,
                                borderRadius: 999,
                                padding: '0 10px',
                                border: `1px solid ${sideBorderColor}`,
                                background: sideTagColor,
                                color: 'rgba(255,255,255,0.9)',
                              }}
                            >
                              {sideLabel}
                            </Tag>

                            {b.bet.externalUrl ? (
                              <a
                                href={b.bet.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'rgba(255,255,255,0.75)' }}
                                aria-label="Open market"
                              >
                                <ExportOutlined />
                              </a>
                            ) : null}
                          </div>

                          <Typography.Text style={styles.subtleText}>
                            {b.bet.placedAt ? formatPlacedAt(b.bet.placedAt) : ''}
                          </Typography.Text>
                        </CardDark>
                      </Col>

                      {/* Probability */}
                      <Col xs={24} md={8}>
                        <CardDark>
                          <Typography.Text style={styles.smallLabel}>Probability</Typography.Text>
                          <Typography.Text style={styles.bigValue}>
                            {Number.isFinite(b.probability) ? `${Math.round(b.probability)}%` : '—'}
                          </Typography.Text>
                          <Typography.Text style={styles.subtleText}>&nbsp;</Typography.Text>
                        </CardDark>
                      </Col>

                      {/* Strategy */}
                      <Col xs={24} md={8}>
                        <CardDark>
                          <>
                            <Space align="center" size={8}>
                              <Typography.Text style={styles.smallLabel}>Strategy</Typography.Text>
                              <Tooltip title="Something nice!">
                                <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.55)' }} />
                              </Tooltip>
                            </Space>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginTop: 8,
                              }}
                            >
                              <span
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 12,
                                  background: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.10)',
                                  color: 'rgba(255,255,255,0.9)',
                                  fontWeight: 600,
                                }}
                              >
                                Risky
                              </span>
                            </div>
                          </>
                        </CardDark>
                      </Col>
                    </Row>
                  </React.Fragment>
                );
              })
            ) : (
              <CardDark>
                <Typography.Text style={{ color: 'rgba(255,255,255,0.65)' }}>
                  No bets found.
                </Typography.Text>
              </CardDark>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
