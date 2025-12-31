import { ClockCircleOutlined, ExportOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { PositionDetails } from '../types';

type PositionDetailsModalProps = {
  id: string;
  open: boolean;
  onClose: () => void;

  /** Optional: override endpoint if you want. Defaults to `/api/positions/:id` */
  endpoint?: (id: string) => string;

  /**
   * Optional: if TradingType isn't string / StrategyLike, provide your own renderer.
   * If omitted, the component tries to render a label + optional tooltip + optional avatars.
   */
  renderStrategy?: (strategy: unknown) => React.ReactNode;

  /** Optional: format money (defaults to USD with 2 decimals) */
  formatMoney?: (n: number) => string;
};

const defaultFormatMoney = (n: number) => `$${n.toFixed(2)}`;

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

export function PositionDetailsModal({
  id,
  open,
  onClose,
  endpoint = (pid) => `/api/positions/${encodeURIComponent(pid)}`,
  renderStrategy,
  formatMoney = defaultFormatMoney,
}: PositionDetailsModalProps) {
  const [data, setData] = useState<PositionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const countdownLabel = useMemo(() => {
    if (!data) return '';
    const { status, remainingSeconds } = data;
    if (status === 'pending' && remainingSeconds) {
      return formatDuration(remainingSeconds);
    }
  }, [data]);

  useEffect(() => {
    if (!open || !id) return;

    const ac = new AbortController();
    setLoading(true);
    setErrMsg(null);

    (async () => {
      try {
        const res = await fetch(endpoint(id), { signal: ac.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as PositionDetails;
        setData(json);
      } catch (e) {
        if ((e as any)?.name === 'AbortError') return;
        setErrMsg((e as Error).message || 'Something went wrong');
        setData(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, open, endpoint]);

  return (
    <Modal
      title={<span style={{ color: '#fff', fontWeight: 700 }}>Position details</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={820}
      styles={{
        content: {
          background: 'linear-gradient(180deg, #27184a 0%, #1c1236 100%)',
          borderRadius: 18,
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
        header: {
          background: 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        },
        body: { paddingTop: 18 },
      }}
    >
      {errMsg && (
        <Alert
          type="error"
          message="Couldn’t load position details"
          description={errMsg}
          showIcon
          style={{
            marginBottom: 12,
            background: 'rgba(255,77,79,0.08)',
            borderColor: 'rgba(255,77,79,0.25)',
            color: '#fff',
          }}
        />
      )}

      {/* Header card (question + totals + status) */}
      <Card
        bordered={false}
        style={{
          background: 'rgba(0,0,0,0.18)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 16,
        }}
        bodyStyle={{ padding: 18 }}
      >
        {loading ? (
          <Skeleton active title paragraph={{ rows: 2 }} />
        ) : (
          <>
            <Typography.Paragraph
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: 18,
                lineHeight: 1.35,
                marginBottom: 18,
              }}
            >
              {data?.question ?? '—'}
            </Typography.Paragraph>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Metric label="Total bet" value={data ? formatMoney(data.totalBet) : '—'} />
              </Col>
              <Col xs={24} md={8}>
                <Metric label="To win" value={data ? formatMoney(data.toWin) : '—'} />
              </Col>
              <Col xs={24} md={8}>
                <Metric
                  label="Status"
                  value={
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.75)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.92)' }}>
                        {data ? countdownLabel : '—'}
                      </span>
                    </span>
                  }
                />
              </Col>
            </Row>
          </>
        )}
      </Card>

      {/* Bets (multiple) */}
      <Typography.Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
        Bets
      </Typography.Text>

      <div style={{ marginTop: 10 }}>
        {loading ? (
          <CardDark>
            <Skeleton active title={false} paragraph={{ rows: 3 }} />
          </CardDark>
        ) : data?.bets?.length ? (
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
                        style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}
                      >
                        <Typography.Text style={styles.bigValue}>
                          {formatMoney(b.bet.amount)} – {sideLabel}
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
                      {renderStrategy ? (
                        renderStrategy(b.strategy)
                      ) : (
                        <>
                          <Space align="center" size={8}>
                            <Typography.Text style={styles.smallLabel}>Strategy</Typography.Text>
                            <Tooltip title="Something nice!">
                              <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.55)' }} />
                            </Tooltip>
                          </Space>

                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}
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
                      )}
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
    </Modal>
  );
}

function CardDark({ children }: { children: React.ReactNode }) {
  return (
    <Card
      bordered={false}
      style={{
        background: 'rgba(0,0,0,0.16)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      bodyStyle={{ padding: 16, minHeight: 104 }}
    >
      {children}
    </Card>
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
