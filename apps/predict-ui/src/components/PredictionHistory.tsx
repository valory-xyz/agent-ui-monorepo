import type { TableProps } from 'antd';
import { Flex, Tag, Typography } from 'antd';
import { Table } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { Card } from '../components/ui/Card';
import { CURRENCY, CurrencyCode } from '../constants/currency';
import { COLOR } from '../constants/theme';
import { usePredictionHistory } from '../hooks/usePredictionHistory';
import { PredictionHistoryItem } from '../types';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

const PredictionHistoryCard = styled(Card)`
  .ant-table {
    background: transparent;
    .ant-table-thead {
      .ant-table-cell {
        padding: 8px 16px;
        color: ${COLOR.WHITE_TRANSPARENT_50};
        font-weight: normal;
        background: ${COLOR.WHITE_TRANSPARENT_5};
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

const NoDataAvailable = () => (
  <Flex align="center" justify="center" style={{ padding: '42px' }}>
    No data available.
  </Flex>
);

const getColumns = (currency: CurrencyCode): TableProps<PredictionHistoryItem>['columns'] => [
  {
    title: 'Market',
    dataIndex: 'market',
    key: 'market',
    width: '60%',
    render: (market: PredictionHistoryItem['market']) => (
      <Text className="text-sm text-white-2">{market.title}</Text>
    ),
  },
  {
    title: 'Prediction',
    dataIndex: 'prediction_side',
    key: 'prediction_side',
    width: '15%',
    render: (side: PredictionHistoryItem['prediction_side']) => (
      <Text className="text-sm text-white-2">{side === 'yes' ? 'Yes' : 'No'}</Text>
    ),
    align: 'center',
    className: 'th-text-center',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '20%',
    render: (_text, record: PredictionHistoryItem) => {
      const amount = record.status === 'pending' ? record.bet_amount : record.net_profit;
      const value = `${CURRENCY[currency].symbol}${Math.abs(amount)}`;

      return record.status === 'lost' ? (
        <Tag bordered={false} color={COLOR.PINK_BACKGROUND} style={{ color: COLOR.PINK }}>
          Lost {value}
        </Tag>
      ) : record.status === 'won' ? (
        <Tag bordered={false} color={COLOR.GREEN_BACKGROUND} style={{ color: COLOR.GREEN }}>
          Won {value}
        </Tag>
      ) : (
        <Tag
          bordered={false}
          color={COLOR.WHITE_TRANSPARENT_5}
          style={{ color: COLOR.WHITE_TRANSPARENT_75 }}
        >
          Bet {value}
        </Tag>
      );
    },
    align: 'center',
    className: 'th-text-center',
  },
];

export const PredictionHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoading, data } = usePredictionHistory({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <PredictionHistoryCard $gap="24px">
      <Title level={4} className="m-0 font-normal">
        Prediction History
      </Title>

      <Table<PredictionHistoryItem>
        columns={getColumns(data?.currency ?? 'USD')}
        dataSource={data?.items ?? []}
        loading={isLoading}
        locale={{ emptyText: <NoDataAvailable /> }}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
        rowHoverable={false}
      />
    </PredictionHistoryCard>
  );
};
