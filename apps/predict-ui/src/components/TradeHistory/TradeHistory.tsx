import { HistoryOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Flex, Spin, Typography } from 'antd';
import { Table } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { CurrencyCode } from '../../constants/currency';
import { COLOR } from '../../constants/theme';
import { useBetHistory } from '../../hooks/useBetHistory';
import { BetHistoryItem } from '../../types';
import { isOmenstratAgent } from '../../utils/agentMap';
import { Card } from '../ui/Card';
import { PositionDetailsModal } from './PositionDetailsModal/PositionDetailsModal';
import { TradeStatus } from './TradeStatus';

const { Title, Text, Paragraph } = Typography;

const PAGE_SIZE = 10;

const PredictionHistoryCard = styled(Card)`
  .ant-table {
    background: transparent;
    .ant-table-thead {
      .ant-table-cell {
        padding: 8px 16px;
        color: ${COLOR.WHITE_TRANSPARENT_50};
        font-weight: normal;
        background: ${COLOR.WHITE_TRANSPARENT_05};
        border-bottom: none;
        &:first-child {
          border-bottom-left-radius: 8px;
        }
        &:last-child {
          border-bottom-right-radius: 8px;
        }
        &::before {
          background: transparent !important;
        }
        &.th-text-center {
          text-align: center;
        }
      }
    }
    .ant-table-tbody {
      .ant-table-row {
        &:hover > td {
          background-color: ${`${COLOR.PRIMARY}33`} !important;
        }
      }
      .ant-table-cell {
        padding: 8px 16px;
        border-color: ${COLOR.WHITE_TRANSPARENT_10} !important;
      }
      .ant-table-row:last-child .ant-table-cell {
        border-bottom: none;
      }
    }
  }
`;

const Loading = () => (
  <Flex align="center" justify="center" style={{ height: 200 }}>
    <Spin spinning />
  </Flex>
);

const NoDataAvailable = () => (
  <Flex align="center" justify="center" vertical style={{ padding: '32px 0' }}>
    <HistoryOutlined
      className="mb-24"
      style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: COLOR.WHITE_TRANSPARENT_50,
      }}
    />
    <Text type="secondary">No data yet.</Text>
    <Text type="secondary">
      Trade history will appear here when your agent places its first trade.
    </Text>
  </Flex>
);

const getColumns = (currency: CurrencyCode): TableProps<BetHistoryItem>['columns'] => [
  {
    title: 'Market',
    dataIndex: 'market',
    key: 'market',
    width: '60%',
    render: (market: BetHistoryItem['market']) => (
      <Paragraph className="text-sm text-white-075 m-0" ellipsis={{ rows: 2, tooltip: true }}>
        {market.title}
      </Paragraph>
    ),
  },
  {
    title: 'Prediction',
    dataIndex: 'prediction_side',
    key: 'prediction_side',
    width: '15%',
    render: (side: BetHistoryItem['prediction_side']) => (
      <Text className="text-sm text-white-075">{side === 'yes' ? 'Yes' : 'No'}</Text>
    ),
    align: 'center',
    className: 'th-text-center',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '20%',
    render: (_text, record: BetHistoryItem) => (
      <TradeStatus
        status={record.status}
        bet_amount={record.bet_amount}
        net_profit={record.net_profit}
        currency={currency}
      />
    ),
    align: 'center',
    className: 'th-text-center',
  },
];

export const TradeHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPositionDetailsModalOpen, setIsPositionDetailsModalOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);

  const { isLoading, data } = useBetHistory({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <PredictionHistoryCard $gap="24px">
      <Title level={4} className="m-0 font-normal">
        Trade History
      </Title>

      {isLoading ? (
        <Loading />
      ) : data?.items.length === 0 ? (
        <NoDataAvailable />
      ) : (
        <Table<BetHistoryItem>
          columns={getColumns(data?.currency ?? 'USD')}
          dataSource={data?.items ?? []}
          loading={isLoading}
          rowKey={(record) => record.id}
          rowHoverable={isOmenstratAgent}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page),
            total: data?.total ?? 0,
          }}
          onRow={(record) => ({
            onClick: () => {
              if (isOmenstratAgent) {
                setSelectedPositionId(record.id);
                setIsPositionDetailsModalOpen(true);
              }
            },
            style: isOmenstratAgent ? { cursor: 'pointer' } : undefined,
          })}
        />
      )}

      {selectedPositionId && isPositionDetailsModalOpen && (
        <PositionDetailsModal
          id={selectedPositionId}
          onClose={() => {
            setIsPositionDetailsModalOpen(false);
            setSelectedPositionId(null);
          }}
        />
      )}
    </PredictionHistoryCard>
  );
};
